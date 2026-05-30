export class SystemRevenueResponseDto {
  period!: string;
  startDate!: Date;
  endDate!: Date;
  totalRevenue!: number;
  totalOrders!: number;
  averageRevenue!: number;
}