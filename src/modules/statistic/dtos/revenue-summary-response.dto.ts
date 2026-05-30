export class RevenueSummaryResponseDto {
  totalRevenue!: number;
  totalOrders!: number;
  averageRevenue!: number;
  topBranchId?: string | null;
  topBranchName?: string | null;
}