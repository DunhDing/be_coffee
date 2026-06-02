import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { StatisticRepository } from '../repo/statistic.repository';
import { BranchRevenueResponseDto } from '../dtos/branch-revenue-response.dto';
import { SystemRevenueResponseDto } from '../dtos/system-revenue-response.dto';
import { RevenueSummaryResponseDto } from '../dtos/revenue-summary-response.dto';

type Period = 'daily' | 'weekly' | 'monthly';

function parseDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) throw new BadRequestException('Invalid date format');
  return d;
}

function startOfDay(d: Date) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function addDays(d: Date, days: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  return dt;
}

function startOfWeek(d: Date) {
  const dt = startOfDay(d);
  const day = dt.getDay();
  const diff = (day + 6) % 7;
  return addDays(dt, -diff);
}

function startOfMonth(d: Date) {
  const dt = new Date(d.getFullYear(), d.getMonth(), 1);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

import { RedisService } from '../../cache/redis.service';

@Injectable()
export class StatisticService {
  constructor(
    private readonly repo: StatisticRepository,
    private readonly redis: RedisService
  ) {}

  private computeRange(period: Period, anchor?: string) {
    const date = parseDate(anchor);
    let start: Date;
    let end: Date;

    if (period === 'daily') {
      start = startOfDay(date);
      end = addDays(start, 1);
    } else if (period === 'weekly') {
      start = startOfWeek(date);
      end = addDays(start, 7);
    } else {
      start = startOfMonth(date);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    }

    return { start, end };
  }

  private toNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    return Number(value.toString());
  }

  async getSystemRevenue(period: Period, anchor?: string): Promise<SystemRevenueResponseDto> {
    try {
      const { start, end } = this.computeRange(period, anchor);
      const where = { order_date: { gte: start, lt: end } };
      const agg = await this.repo.aggregateOrders(where as any);

      const totalRevenue = this.toNumber(agg._sum?.total_amount);
      const totalOrders = agg._count?._all ?? 0;
      const averageRevenue = totalOrders > 0 ? this.toNumber(agg._avg?.total_amount) : 0;

      return { period, startDate: start, endDate: end, totalRevenue, totalOrders, averageRevenue };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch system revenue');
    }
  }

  async getBranchRevenue(branchId: string, period: Period, anchor?: string): Promise<BranchRevenueResponseDto> {
    try {
      const branch = await this.repo.findBranchById(branchId);
      if (!branch) throw new NotFoundException('Branch not found');

      const { start, end } = this.computeRange(period, anchor);
      const where = { order_date: { gte: start, lt: end }, branch_id: branchId };
      const agg = await this.repo.aggregateOrders(where as any);

      const totalRevenue = this.toNumber(agg._sum?.total_amount);
      const totalOrders = agg._count?._all ?? 0;
      const averageRevenue = totalOrders > 0 ? this.toNumber(agg._avg?.total_amount) : 0;

      return { branchId, branchName: branch.branch_name, period, startDate: start, endDate: end, totalRevenue, totalOrders, averageRevenue };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to fetch branch revenue');
    }
  }

  async getSummary(): Promise<RevenueSummaryResponseDto> {
    try {
      const agg = await this.repo.aggregateOrders({} as any);
      const totalRevenue = this.toNumber(agg._sum?.total_amount);
      const totalOrders = agg._count?._all ?? 0;
      const averageRevenue = totalOrders > 0 ? this.toNumber(agg._avg?.total_amount) : 0;

      const top = await this.repo.getTopBranch({});
      let topBranchId: string | null = null;
      let topBranchName: string | null = null;
      if (top?.branch_id) {
        topBranchId = top.branch_id;
        const branches = await this.repo.findBranchesByIds([top.branch_id]);
        topBranchName = branches.length > 0 ? branches[0].branch_name : null;
      }

      return { totalRevenue, totalOrders, averageRevenue, topBranchId, topBranchName };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch revenue summary');
    }
  }

  /**
   * Dashboard stats for admin FE home page
   */
  async getDashboardStats() {
    try {
      const cacheKey = 'statistics:dashboard';
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached as any;

      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);
      const yesterday = addDays(today, -1);

      const [todayAgg, yesterdayAgg, totalCustomers, activeBranches] = await Promise.all([
        this.repo.aggregateOrders({ order_date: { gte: today, lt: tomorrow }, status: 'Completed' }),
        this.repo.aggregateOrders({ order_date: { gte: yesterday, lt: today }, status: 'Completed' }),
        this.repo.countCustomers(),
        this.repo.countActiveBranches(),
      ]);

      const revenueToday = this.toNumber(todayAgg._sum?.total_amount);
      const revenueYesterday = this.toNumber(yesterdayAgg._sum?.total_amount);
      const revenueGrowth = revenueYesterday > 0
        ? Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100)
        : 0;

      const ordersToday = todayAgg._count?._all ?? 0;
      const ordersYesterday = yesterdayAgg._count?._all ?? 0;
      const ordersGrowth = ordersYesterday > 0
        ? Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100)
        : 0;

      // New customers today
      const newCustomers = await this.repo.countNewCustomersToday(today, tomorrow);

      const result = {
        revenueToday,
        revenueGrowth,
        ordersToday,
        ordersGrowth,
        totalCustomers,
        newCustomers,
        activeBranches,
      };

      await this.redis.set(cacheKey, result, 60); // Cache for 60 seconds
      return result;
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch dashboard stats');
    }
  }

  /**
   * Revenue chart by day for a given month
   */
  async getRevenueChart(monthStr: string, branchId?: string) {
    try {
      // monthStr format: "yyyy-mm"
      const [year, month] = monthStr.split('-').map(Number);
      if (!year || !month) throw new BadRequestException('Invalid month format. Use yyyy-mm');

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const orders = await this.repo.getOrdersByDateRange(startDate, endDate, branchId);

      // Group by day
      const daysInMonth = new Date(year, month, 0).getDate();
      const result: { label: string; revenue: number; orders: number }[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStart = new Date(year, month - 1, day);
        const dayEnd = new Date(year, month - 1, day + 1);

        const dayOrders = orders.filter((o: any) => {
          const orderDate = new Date(o.order_date);
          return orderDate >= dayStart && orderDate < dayEnd;
        });

        const revenue = dayOrders.reduce((sum: number, o: any) => sum + this.toNumber(o.total_amount), 0);
        const ordersCount = dayOrders.length;

        result.push({
          label: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`,
          revenue,
          orders: ordersCount,
        });
      }

      return result;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to fetch revenue chart');
    }
  }

  async getBranchStats(startDate?: string, endDate?: string) {
    try {
      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);
      
      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        start = startOfDay(new Date(startDate));
        end = addDays(startOfDay(new Date(endDate)), 1);
      } else {
        // If no range provided, default to all-time total
        start = new Date('2000-01-01');
        end = new Date('2100-01-01');
      }

      const [todayGroups, rangeGroups, branchesData] = await Promise.all([
        this.repo.groupByBranch({ order_date: { gte: today, lt: tomorrow }, status: 'Completed' }),
        this.repo.groupByBranch({ order_date: { gte: start, lt: end }, status: 'Completed' }),
        this.repo.findAllBranches(),
      ]);
      
      return branchesData.map(branch => {
        const todayStat = todayGroups.find(g => g.branch_id === branch.branch_id);
        const rangeStat = rangeGroups.find(g => g.branch_id === branch.branch_id);
        
        return {
          branchId: branch.branch_id,
          branchName: branch.branch_name,
          daily: this.toNumber(todayStat?._sum?.total_amount),
          dailyOrders: todayStat?._count?._all ?? 0,
          total: this.toNumber(rangeStat?._sum?.total_amount),
          totalOrders: rangeStat?._count?._all ?? 0,
        };
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch branch stats');
    }
  }
}
