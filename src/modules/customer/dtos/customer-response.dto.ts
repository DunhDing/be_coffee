import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerResponseDto {
    @ApiProperty({ example: '' })
    customer_id!: string;

    @ApiProperty({ example: 'Nguyen Van A' })
    full_name!: string;

    @ApiPropertyOptional({ example: '0123456789' })
    phone_number?: string | null;

    @ApiPropertyOptional({ example: 'example@gmail.com' })
    email?: string | null;

    @ApiProperty({ example: 0 })
    total_points!: number | null;

    @ApiProperty({ example: '00000000-0000-0000-0000-000000000000' })
    account_id!: string;

    @ApiPropertyOptional()
    loyaltyTier?: string;

    @ApiPropertyOptional()
    totalOrders?: number;

    @ApiPropertyOptional()
    totalSpent?: number;

    @ApiPropertyOptional()
    joinedAt?: string;
}
