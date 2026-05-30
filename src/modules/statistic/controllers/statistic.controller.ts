import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StatisticService } from '../services/statistic.service';
import { RevenueFilterDto } from '../dtos/revenue-filter.dto';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticController {
  constructor(private readonly service: StatisticService) {}

  /**
   * Dashboard stats — for admin home page
   * GET /statistics/dashboard
   */
  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats (revenue today, orders, customers, branches)' })
  getDashboard() {
    return this.service.getDashboardStats();
  }

  /**
   * Revenue chart by month
   * GET /statistics/revenue?month=yyyy-mm&branchId=xxx
   */
  @Get('revenue')
  @ApiOperation({ summary: 'Revenue chart by day for a given month' })
  @ApiQuery({ name: 'month', required: true, type: String, example: '2026-05' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  getRevenueChart(
    @Query('month') month: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.service.getRevenueChart(month, branchId);
  }

  /**
   * Per-branch stats today
   * GET /statistics/branches
   */
  @Get('branches')
  @ApiOperation({ summary: 'Per-branch revenue stats' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getBranchStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getBranchStats(startDate, endDate);
  }

  // Legacy endpoints kept for compatibility
  @Get('revenue/system/daily')
  async systemDaily(@Query() q: RevenueFilterDto) {
    return this.service.getSystemRevenue('daily', q.date);
  }

  @Get('revenue/system/weekly')
  async systemWeekly(@Query() q: RevenueFilterDto) {
    return this.service.getSystemRevenue('weekly', q.date);
  }

  @Get('revenue/system/monthly')
  async systemMonthly(@Query() q: RevenueFilterDto) {
    return this.service.getSystemRevenue('monthly', q.date);
  }

  @Get('revenue/branch/:branchId/daily')
  async branchDaily(@Param('branchId') branchId: string, @Query() q: RevenueFilterDto) {
    return this.service.getBranchRevenue(branchId, 'daily', q.date);
  }

  @Get('revenue/branch/:branchId/weekly')
  async branchWeekly(@Param('branchId') branchId: string, @Query() q: RevenueFilterDto) {
    return this.service.getBranchRevenue(branchId, 'weekly', q.date);
  }

  @Get('revenue/branch/:branchId/monthly')
  async branchMonthly(@Param('branchId') branchId: string, @Query() q: RevenueFilterDto) {
    return this.service.getBranchRevenue(branchId, 'monthly', q.date);
  }

  @Get('summary')
  async summary() {
    return this.service.getSummary();
  }
}
