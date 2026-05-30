import {
    BadRequestException,
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { payment_status } from '@prisma/client';
import { ErrorCodes } from '../../common/constants/error-codes';
import { PaymentRepository } from './payment.repository';
import { CreateVietQrPaymentDto } from './dto/create-vietqr-payment.dto';
import { VietQrWebhookDto } from './dto/vietqr-webhook.dto';
import { LoyaltyService } from '../loyalty/services/loyalty.service';
import { CreateCashPaymentDto } from './dto/create-cash-payment.dto';

type VietQrConfig = {
    bankId: string;
    accountNo: string;
    accountName: string;
    template: string;
};

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly loyaltyService: LoyaltyService,
    ) { }

    private getWebhookSecret() {
        return process.env.VIETQR_WEBHOOK_SECRET?.trim();
    }

    private getVietQrConfig(): VietQrConfig {
        const bankId = process.env.VIETQR_BANK_ID?.trim();
        const accountNo = process.env.VIETQR_ACCOUNT_NO?.trim();
        const accountName = process.env.VIETQR_ACCOUNT_NAME?.trim();
        const template = process.env.VIETQR_TEMPLATE?.trim() || 'compact2';

        if (!bankId || !accountNo || !accountName) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Missing VietQR configuration. Please set VIETQR_BANK_ID, VIETQR_ACCOUNT_NO and VIETQR_ACCOUNT_NAME in .env',
            });
        }

        return {
            bankId,
            accountNo,
            accountName,
            template,
        };
    }

    private buildVietQrUrl(amount: string, description: string, config: VietQrConfig) {
        const params = new URLSearchParams({
            amount,
            addInfo: description,
            accountName: config.accountName,
        });

        return `https://img.vietqr.io/image/${config.bankId}-${config.accountNo}-${config.template}.png?${params.toString()}`;
    }

    private async markOrderAsPaid(orderId: string, previousStatus?: payment_status) {
        await this.paymentRepository.updateOrderStatus(orderId, 'Paid');

        if (previousStatus !== payment_status.PAID) {
            return this.loyaltyService.syncPointsFromPaidOrder(orderId);
        }

        return {
            skipped: true,
            earnedPoints: 0,
            currentPoints: 0,
            reason: 'PAYMENT_ALREADY_PAID',
        };
    }

    async createVietQrPayment(dto: CreateVietQrPaymentDto) {
        const order = await this.paymentRepository.findOrderById(dto.order_id);

        if (!order) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Order with ID "${dto.order_id}" not found`,
            });
        }

        const paidPayment = await this.paymentRepository.findPaymentByOrderIdAndStatus(
            dto.order_id,
            payment_status.PAID,
        );

        if (paidPayment) {
            throw new ConflictException({
                code: ErrorCodes.CONFLICT,
                message: `Order "${dto.order_id}" has already been paid`,
            });
        }

        const config = this.getVietQrConfig();
        const amount = order.total_amount.toString();
        const description = dto.description?.trim() || `Thanh toan don hang ${dto.order_id}`;
        const qrCodeUrl = this.buildVietQrUrl(amount, description, config);

        const existingPendingPayment = await this.paymentRepository.findPaymentByOrderIdAndStatus(
            dto.order_id,
            payment_status.PENDING,
        );

        const payment =
            existingPendingPayment ??
            (await this.paymentRepository.createPayment({
                order_id: dto.order_id,
                status: payment_status.PENDING,
            }));

        return {
            message: 'VietQR payment created successfully',
            data: {
                payment_id: payment.payment_id,
                order_id: dto.order_id,
                status: payment.status ?? payment_status.PENDING,
                amount,
                description,
                qr_code_url: qrCodeUrl,
                bank: {
                    bank_id: config.bankId,
                    account_no: config.accountNo,
                    account_name: config.accountName,
                    template: config.template,
                },
            },
        };
    }

    async handleVietQrWebhook(dto: VietQrWebhookDto, webhookSecret?: string) {
        const expectedSecret = this.getWebhookSecret();

        if (expectedSecret && webhookSecret !== expectedSecret) {
            throw new ForbiddenException({
                code: ErrorCodes.FORBIDDEN,
                message: 'Invalid webhook secret',
            });
        }

        if (!dto.payment_id && !dto.order_id) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Either payment_id or order_id must be provided',
            });
        }

        const normalizedStatus = dto.status.toUpperCase() as payment_status;
        const targetPayment = dto.payment_id
            ? await this.paymentRepository.findPaymentById(dto.payment_id)
            : await this.paymentRepository.findPaymentByOrderId(dto.order_id as string);

        if (!targetPayment) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Payment record not found',
            });
        }

        const updatedPayment =
            targetPayment.status === normalizedStatus
                ? targetPayment
                : await this.paymentRepository.updatePaymentStatus(targetPayment.payment_id, normalizedStatus);

        let loyaltySync: {
            skipped: boolean;
            earnedPoints: number;
            currentPoints: number;
            reason: string | null;
            history?: unknown;
        } | null = null;

        if (normalizedStatus === payment_status.PAID && targetPayment.order_id) {
            loyaltySync = await this.markOrderAsPaid(targetPayment.order_id, targetPayment.status);
        }

        if (normalizedStatus === payment_status.FAILED && targetPayment.order_id) {
            await this.paymentRepository.updateOrderStatus(targetPayment.order_id, 'Payment Failed');
        }

        return {
            message: 'VietQR webhook processed successfully',
            data: {
                payment_id: updatedPayment.payment_id,
                order_id: updatedPayment.order_id,
                status: updatedPayment.status,
                amount: dto.amount,
                transaction_id: dto.transaction_id,
                description: dto.description,
                loyaltySync,
            },
        };
    }

    async createCashPayment(dto: CreateCashPaymentDto) {
        const order = await this.paymentRepository.findOrderById(dto.order_id);

        if (!order) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Order with ID "${dto.order_id}" not found`,
            });
        }

        const paidPayment = await this.paymentRepository.findPaymentByOrderIdAndStatus(
            dto.order_id,
            payment_status.PAID,
        );

        if (paidPayment) {
            throw new ConflictException({
                code: ErrorCodes.CONFLICT,
                message: `Order "${dto.order_id}" has already been paid`,
            });
        }

        const pendingPayment = await this.paymentRepository.findPaymentByOrderIdAndStatus(
            dto.order_id,
            payment_status.PENDING,
        );

        const payment = pendingPayment
            ? await this.paymentRepository.updatePaymentStatus(pendingPayment.payment_id, payment_status.PAID)
            : await this.paymentRepository.createPayment({
                order_id: dto.order_id,
                status: payment_status.PAID,
            });

        const loyaltySync = await this.markOrderAsPaid(dto.order_id, pendingPayment?.status);

        return {
            message: 'Cash payment created successfully',
            data: {
                payment_id: payment.payment_id,
                order_id: dto.order_id,
                status: payment.status ?? payment_status.PAID,
                amount: order.total_amount.toString(),
                description: `Thanh toan tien mat cho don hang ${dto.order_id}`,
                loyaltySync,
            },
        };
    }
}