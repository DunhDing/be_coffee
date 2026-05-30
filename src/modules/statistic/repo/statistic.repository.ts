import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  return Number(value.toString());
}

@Injectable()
export class StatisticRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBranchById(branchId: string) {
    return this.prisma.branch.findUnique({ where: { branch_id: branchId } });
  }

  aggregateOrders(where: any) {
    return this.prisma.orders.aggregate({
      where,
      _sum: { total_amount: true },
      _count: { _all: true },
      _avg: { total_amount: true },
    });
  }

  groupByBranch(where: any) {
    return this.prisma.orders.groupBy({
      by: ['branch_id'],
      where,
      _sum: { total_amount: true },
      _count: { _all: true },
    });
  }

  async getTopBranch(where: any) {
    const groups = await this.groupByBranch(where);
    if (!groups || groups.length === 0) return null;
    const sorted = groups
      .map((g) => ({ branch_id: g.branch_id, total: toNumber(g._sum?.total_amount) }))
      .sort((a, b) => b.total - a.total);
    return sorted[0] || null;
  }

  async findBranchesByIds(ids: string[]) {
    return this.prisma.branch.findMany({ where: { branch_id: { in: ids } } });
  }

  async findAllBranches() {
    return this.prisma.branch.findMany({ orderBy: { branch_name: 'asc' } });
  }

  countCustomers() {
    return this.prisma.customer.count();
  }

  countActiveBranches() {
    return this.prisma.branch.count({ where: { status: 'Active' } });
  }

  countNewCustomersToday(start: Date, end: Date) {
    // There's no created_at on customer in the schema, use account created_at
    // approximate: count customers whose account was created today
    return this.prisma.customer.count({
      where: {
        account: {
          created_at: { gte: start, lt: end },
        },
      },
    });
  }

  getOrdersByDateRange(start: Date, end: Date, branchId?: string) {
    const where: any = {
      order_date: { gte: start, lt: end },
    };
    if (branchId) where.branch_id = branchId;

    return this.prisma.orders.findMany({
      where,
      select: {
        order_id: true,
        order_date: true,
        total_amount: true,
        branch_id: true,
        status: true,
      },
    });
  }
}
