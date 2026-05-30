import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class EarnPointDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Customer ID' })
    @IsNotEmpty({ message: 'Customer ID is required' })
    @IsUUID('4', { message: 'Customer ID must be a valid UUID' })
    customerId!: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'Order ID' })
    @IsNotEmpty({ message: 'Order ID is required' })
    @IsUUID('4', { message: 'Order ID must be a valid UUID' })
    orderId!: string;
}
