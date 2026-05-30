import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsUUID,
    Min,
} from 'class-validator';

export class RedeemPointDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Customer ID' })
    @IsNotEmpty({ message: 'Customer ID is required' })
    @IsUUID('4', { message: 'Customer ID must be a valid UUID' })
    customerId!: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'Order ID' })
    @IsNotEmpty({ message: 'Order ID is required' })
    @IsUUID('4', { message: 'Order ID must be a valid UUID' })
    orderId!: string;

    @ApiProperty({ example: 100, description: 'Points to redeem' })
    @IsNotEmpty({ message: 'Points is required' })
    @IsInt({ message: 'Points must be an integer' })
    @Min(1, { message: 'Points must be greater than 0' })
    points!: number;
}
