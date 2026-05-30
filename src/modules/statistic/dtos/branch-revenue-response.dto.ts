export class BranchRevenueResponseDto {
  branchId!: string;
  branchName?: string | null;
  period!: string;
  startDate!: Date;
  endDate!: Date;
  totalRevenue!: number;
  totalOrders!: number;
  averageRevenue!: number;
}