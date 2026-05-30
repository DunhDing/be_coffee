import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateVietQrPaymentDto {
    @ApiProperty({ example: 'c3f3e54e-8df3-4b1e-9f57-74d5b9d58c2f' })
    @IsNotEmpty({ message: 'Order ID is required' })
    @IsUUID('4', { message: 'Order ID must be a valid UUID' })
    order_id!: string;

    @ApiProperty({ example: 'Thanh toan don hang coffee #123', required: false })
    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    description?: string;
}