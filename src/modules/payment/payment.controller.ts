import { Body, Controller, Headers, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreateVietQrPaymentDto } from './dto/create-vietqr-payment.dto';
import { VietQrPaymentResponseDto } from './dto/vietqr-payment-response.dto';
import { VietQrWebhookDto } from './dto/vietqr-webhook.dto';
import { CreateCashPaymentDto } from './dto/create-cash-payment.dto';
import { CashPaymentResponseDto } from './dto/cash-payment-response.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('vietqr')
    @ApiOperation({ summary: 'Create a VietQR payment for an order' })
    @ApiBody({ type: CreateVietQrPaymentDto })
    @ApiCreatedResponse({ description: 'VietQR payment created successfully', type: VietQrPaymentResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body or missing VietQR configuration' })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiConflictResponse({ description: 'Order already paid' })
    createVietQrPayment(@Body() dto: CreateVietQrPaymentDto) {
        return this.paymentService.createVietQrPayment(dto);
    }

    @Post('cash')
    @ApiOperation({ summary: 'Create a cash payment and mark the order as paid' })
    @ApiBody({ type: CreateCashPaymentDto })
    @ApiCreatedResponse({ description: 'Cash payment created successfully', type: CashPaymentResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body' })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiConflictResponse({ description: 'Order already paid' })
    createCashPayment(@Body() dto: CreateCashPaymentDto) {
        return this.paymentService.createCashPayment(dto);
    }

    @Post('vietqr/webhook')
    @ApiOperation({ summary: 'Receive VietQR webhook/callback to update payment status' })
    @ApiBody({ type: VietQrWebhookDto })
    @ApiOkResponse({ description: 'Webhook processed successfully' })
    @ApiBadRequestResponse({ description: 'Invalid request body' })
    @ApiNotFoundResponse({ description: 'Payment record not found' })
    @ApiForbiddenResponse({ description: 'Invalid webhook secret' })
    handleVietQrWebhook(
        @Body() dto: VietQrWebhookDto,
        @Headers('x-webhook-secret') webhookSecret?: string,
    ) {
        return this.paymentService.handleVietQrWebhook(dto, webhookSecret);
    }
}