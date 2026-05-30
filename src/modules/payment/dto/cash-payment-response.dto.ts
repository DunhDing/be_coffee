import { ApiProperty } from '@nestjs/swagger';

export class CashPaymentResponseDto {
    @ApiProperty({ example: 'payment-uuid' })
    payment_id!: string;

    @ApiProperty({ example: 'order-uuid' })
    order_id!: string;

    @ApiProperty({ example: 'PAID' })
    status!: string;

    @ApiProperty({ example: '75000' })
    amount!: string;

    @ApiProperty({ example: 'Thanh toan tien mat cho don hang coffee #123' })
    description!: string;
}