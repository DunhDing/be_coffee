import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'uuid-product-id' })
  productId!: string;

  @ApiProperty({ example: 'Cà phê sữa' })
  productName!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: 45000 })
  price!: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'uuid-branch-id' })
  branchId?: string;

  @ApiPropertyOptional({ example: 'uuid-customer-id' })
  customerId?: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  customerName!: string;

  @ApiProperty({ example: '0901234567' })
  customerPhone!: string;

  @ApiPropertyOptional({ example: '123 Lê Lợi, Q1' })
  deliveryAddress?: string;

  @ApiProperty({ example: 'Cash', enum: ['Cash', 'Banking'] })
  paymentMethod!: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  items!: CreateOrderItemDto[];

  @ApiProperty({ example: 90000 })
  total!: number;

  @ApiPropertyOptional({ example: 120 })
  pointsEarned?: number;

  @ApiPropertyOptional({ example: 50 })
  pointsUsed?: number;
}
