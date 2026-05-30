import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderRepository {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find or create payment method by name
     */
    async findOrCreatePaymentMethod(methodName: string): Promise<string> {
        let pm = await this.prisma.payment_method.findFirst({
            where: { method_name: methodName },
        });
        if (!pm) {
            pm = await this.prisma.payment_method.create({
                data: { method_name: methodName },
            });
        }
        return pm.payment_id;
    }

    /**
     * Create an order with its items
     */
    async create(input: {
        branchId?: string;
        customerId?: string;
        employeeId?: string;
        paymentId?: string;
        totalAmount: number;
        status: string;
        deliveryAddress?: string;
        pointsEarned?: number;
        pointsUsed?: number;
        items: { productId: string; quantity: number; unitPrice: number; subAmount: number }[];
    }) {
        return this.prisma.orders.create({
            data: {
                branch_id: input.branchId ?? null,
                customer_id: input.customerId ?? null,
                employee_id: input.employeeId ?? null,
                payment_id: input.paymentId ?? null,
                total_amount: input.totalAmount,
                status: input.status,
                delivery_address: input.deliveryAddress ?? null,
                points_earned: input.pointsEarned ?? 0,
                points_used: input.pointsUsed ?? 0,
                order_details: {
                    create: input.items.map((item) => ({
                        product_id: item.productId,
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                        sub_amount: item.subAmount,
                    })),
                },
            },
            include: {
                order_details: {
                    include: { product: true },
                },
                branch: true,
                customer: true,
                payment_method: true,
            },
        });
    }

    /**
     * Find all orders with pagination and filters
     */
    async findAll(params: {
        skip?: number;
        take?: number;
        branchId?: string;
        status?: string;
    }) {
        const where: any = {};
        if (params.branchId) where.branch_id = params.branchId;
        if (params.status) where.status = params.status;

        return this.prisma.orders.findMany({
            where,
            skip: params.skip,
            take: params.take,
            orderBy: { order_date: 'desc' },
            include: {
                order_details: {
                    include: { product: true },
                },
                branch: true,
                customer: true,
                payment_method: true,
            },
        });
    }

    /**
     * Count orders with filters
     */
    async count(params: { branchId?: string; status?: string }) {
        const where: any = {};
        if (params.branchId) where.branch_id = params.branchId;
        if (params.status) where.status = params.status;
        return this.prisma.orders.count({ where });
    }

    /**
     * Find orders by customer ID
     */
    async findByCustomerId(customerId: string) {
        return this.prisma.orders.findMany({
            where: { customer_id: customerId },
            orderBy: { order_date: 'desc' },
            include: {
                order_details: {
                    include: { product: true },
                },
                branch: true,
                payment_method: true,
            },
        });
    }

    /**
     * Find order by ID
     */
    async findById(orderId: string) {
        return this.prisma.orders.findUnique({
            where: { order_id: orderId },
            include: {
                order_details: {
                    include: { product: true },
                },
                branch: true,
                customer: true,
                payment_method: true,
            },
        });
    }

    /**
     * Update order status
     */
    async updateStatus(orderId: string, status: string) {
        return this.prisma.orders.update({
            where: { order_id: orderId },
            data: { status },
            include: {
                order_details: {
                    include: { product: true },
                },
                branch: true,
                customer: true,
                payment_method: true,
            },
        });
    }
}