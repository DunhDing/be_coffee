import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BranchResponseDto {
    @ApiProperty({ example: '' })
    branch_id!: string;

    @ApiProperty({ example: 'Branch A' })
    branch_name!: string;

    @ApiProperty({ example: '123 Main Street, City, State' })
    address!: string;

    @ApiProperty({ example: '0123456789' })
    phone_number!: string;

    @ApiProperty({ example: '2024-01-15' })
    established_date!: Date;

    @ApiProperty()
    created_at?: Date;

    @ApiProperty()
    updated_at?: Date;

    @ApiPropertyOptional()
    image?: string;

    @ApiPropertyOptional()
    status?: string;

    @ApiPropertyOptional()
    employeeCount?: number;

    @ApiPropertyOptional()
    activeOrders?: number;

    @ApiPropertyOptional()
    revenueToday?: number;
}
