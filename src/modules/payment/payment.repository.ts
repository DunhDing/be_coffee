import { Injectable } from '@nestjs/common';
import { payment_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentRepository {
    constructor(private readonly prisma: PrismaService) { }

    findOrderById(orderId: string) {
        return this.prisma.orders.findUnique({
            where: { order_id: orderId },
        });
    }

    findPaymentByOrderIdAndStatus(orderId: string, status: payment_status) {
        return this.prisma.payment.findFirst({
            where: {
                order_id: orderId,
                status,
            },
        });
    }

    findPaymentById(paymentId: string) {
        return this.prisma.payment.findUnique({
            where: { payment_id: paymentId },
        });
    }

    findPaymentByOrderId(orderId: string) {
        return this.prisma.payment.findFirst({
            where: { order_id: orderId },
            orderBy: { payment_id: 'desc' },
        });
    }

    createPayment(input: { order_id: string; status: payment_status }) {
        return this.prisma.payment.create({
            data: {
                order_id: input.order_id,
                status: input.status,
            },
        });
    }

    updatePaymentStatus(paymentId: string, status: payment_status) {
        return this.prisma.payment.update({
            where: { payment_id: paymentId },
            data: { status },
        });
    }

    updateOrderStatus(orderId: string, status: string) {
        return this.prisma.orders.update({
            where: { order_id: orderId },
            data: { status },
        });
    }
}