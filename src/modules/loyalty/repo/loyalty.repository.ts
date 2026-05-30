import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLoyaltyConfigDto } from '../dtos/create-loyalty-config.dto';
import { UpdateLoyaltyConfigDto } from '../dtos/update-loyalty-config.dto';

@Injectable()
export class LoyaltyRepository {
    constructor(private readonly prisma: PrismaService) { }

    findConfigs() {
        return this.prisma.loyalty_config.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });
    }

    findCurrentConfig() {
        return this.prisma.loyalty_config.findFirst({
            orderBy: {
                created_at: 'desc',
            },
        });
    }

    findConfigById(configId: string) {
        return this.prisma.loyalty_config.findUnique({
            where: { config_id: configId },
        });
    }

    createConfig(dto: CreateLoyaltyConfigDto) {
        return this.prisma.loyalty_config.create({
            data: {
                earn_rate_amount: dto.earn_rate_amount,
                earn_rate_point: dto.earn_rate_point,
                redeem_rate_point: dto.redeem_rate_point,
                redeem_rate_amount: dto.redeem_rate_amount,
                updated_at: new Date(),
            },
        });
    }

    updateConfig(configId: string, dto: UpdateLoyaltyConfigDto) {
        const data: UpdateLoyaltyConfigDto = {};

        if (dto.earn_rate_amount !== undefined) data.earn_rate_amount = dto.earn_rate_amount;
        if (dto.earn_rate_point !== undefined) data.earn_rate_point = dto.earn_rate_point;
        if (dto.redeem_rate_point !== undefined) data.redeem_rate_point = dto.redeem_rate_point;
        if (dto.redeem_rate_amount !== undefined) data.redeem_rate_amount = dto.redeem_rate_amount;

        return this.prisma.loyalty_config.update({
            where: { config_id: configId },
            data,
        });
    }

    deleteConfig(configId: string) {
        return this.prisma.loyalty_config.delete({
            where: { config_id: configId },
        });
    }

    findCustomerById(customerId: string) {
        return this.prisma.customer.findUnique({
            where: { customer_id: customerId },
            select: {
                customer_id: true,
                full_name: true,
                phone_number: true,
                email: true,
                total_points: true,
            },
        });
    }

    findOrderById(orderId: string) {
        return this.prisma.orders.findUnique({
            where: { order_id: orderId },
            select: {
                order_id: true,
                customer_id: true,
                branch_id: true,
                total_amount: true,
                order_date: true,
                status: true,
                points_earned: true,
                points_used: true,
            },
        });
    }

    updateCustomerPoints(customerId: string, pointChange: number) {
        return this.prisma.customer.update({
            where: { customer_id: customerId },
            data: {
                total_points: {
                    increment: pointChange,
                },
            },
            select: {
                customer_id: true,
                total_points: true,
            },
        });
    }

    createPointHistory(input: {
        customer_id: string;
        order_id: string;
        point_change: number;
    }) {
        return this.prisma.point_history.create({
            data: input,
            include: {
                orders: true,
            },
        });
    }

    findPointHistoryByCustomerAndOrder(customerId: string, orderId: string, pointChangeType?: 'earn' | 'redeem') {
        const whereClause: any = {
            customer_id: customerId,
            order_id: orderId,
        };
        if (pointChangeType === 'earn') {
            whereClause.point_change = { gt: 0 };
        } else if (pointChangeType === 'redeem') {
            whereClause.point_change = { lt: 0 };
        }

        return this.prisma.point_history.findFirst({
            where: whereClause,
            select: {
                history_id: true,
                customer_id: true,
                order_id: true,
                point_change: true,
                created_at: true,
            },
        });
    }

    getCustomerHistory(customerId: string) {
        return this.prisma.point_history.findMany({
            where: { customer_id: customerId },
            orderBy: {
                created_at: 'desc',
            },
            include: {
                orders: true,
            },
        });
    }

    getAllCustomers() {
        return this.prisma.customer.findMany({
            select: {
                customer_id: true,
                full_name: true,
                total_points: true,
            },
        });
    }

    getCustomerOrders(customerId: string) {
        return this.prisma.orders.findMany({
            where: { customer_id: customerId },
            select: {
                order_id: true,
                total_amount: true,
                status: true,
            },
        });
    }

    getTopCustomers(limit = 10) {
        return this.prisma.customer.findMany({
            take: limit,
            orderBy: {
                total_points: 'desc',
            },
            select: {
                customer_id: true,
                full_name: true,
                total_points: true,
            },
        });
    }

    getTotalPointsIssued() {
        return this.prisma.point_history.aggregate({
            where: {
                point_change: {
                    gt: 0,
                },
            },
            _sum: {
                point_change: true,
            },
        });
    }

    getTotalPointsRedeemed() {
        return this.prisma.point_history.aggregate({
            where: {
                point_change: {
                    lt: 0,
                },
            },
            _sum: {
                point_change: true,
            },
        });
    }
}
