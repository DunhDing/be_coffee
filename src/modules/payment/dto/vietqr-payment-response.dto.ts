import { ApiProperty } from '@nestjs/swagger';

export class VietQrPaymentBankDto {
    @ApiProperty({ example: 'mbbank' })
    bank_id!: string;

    @ApiProperty({ example: '0123456789' })
    account_no!: string;

    @ApiProperty({ example: 'NGUYEN VAN A' })
    account_name!: string;

    @ApiProperty({ example: 'compact2' })
    template!: string;
}

export class VietQrPaymentResponseDto {
    @ApiProperty({ example: 'payment-uuid' })
    payment_id!: string;

    @ApiProperty({ example: 'order-uuid' })
    order_id!: string;

    @ApiProperty({ example: 'PENDING' })
    status!: string;

    @ApiProperty({ example: '75000' })
    amount!: string;

    @ApiProperty({ example: 'Thanh toan don hang coffee #123' })
    description!: string;

    @ApiProperty({ example: 'https://img.vietqr.io/image/mbbank-0123456789-compact2.png?amount=75000&addInfo=Thanh%20toan%20don%20hang%20coffee%20%23123&accountName=NGUYEN%20VAN%20A' })
    qr_code_url!: string;

    @ApiProperty({ type: VietQrPaymentBankDto })
    bank!: VietQrPaymentBankDto;
}