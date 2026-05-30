import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class VietQrWebhookDto {
    @ApiPropertyOptional({ example: 'payment-uuid' })
    @IsOptional()
    @IsUUID('4', { message: 'payment_id must be a valid UUID' })
    payment_id?: string;

    @ApiPropertyOptional({ example: 'order-uuid' })
    @IsOptional()
    @IsUUID('4', { message: 'order_id must be a valid UUID' })
    order_id?: string;

    @ApiProperty({ example: 'PAID', enum: ['PENDING', 'FAILED', 'PAID'] })
    @IsString({ message: 'status must be a string' })
    @IsIn(['PENDING', 'FAILED', 'PAID'], { message: 'status must be one of PENDING, FAILED, PAID' })
    status!: 'PENDING' | 'FAILED' | 'PAID';

    @ApiPropertyOptional({ example: '75000' })
    @IsOptional()
    @IsString({ message: 'amount must be a string' })
    amount?: string;

    @ApiPropertyOptional({ example: 'GD123456789' })
    @IsOptional()
    @IsString({ message: 'transaction_id must be a string' })
    transaction_id?: string;

    @ApiPropertyOptional({ example: 'Paid via VietQR' })
    @IsOptional()
    @IsString({ message: 'description must be a string' })
    description?: string;
}