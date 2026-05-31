import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountRepository {
    constructor(private readonly prisma: PrismaService) { }

    findByUsername(username: string) {
        return this.prisma.account.findUnique({
            where: { username },
            include: { role: true },
        });
    }

    createAccount(input: { username: string; passwordHash: string; status?: string; roleId?: string }) {
        return this.prisma.account.create({
            data: {
                username: input.username,
                password_hash: input.passwordHash,
                status: input.status,
                role_id: input.roleId ?? null,
            },
            select: {
                account_id: true,
                username: true,
                role_id: true,
                status: true,
                created_at: true,
            },
        });
    }

    async getCustomerAccountSummary(accountId: string) {
        const account = await this.prisma.account.findUnique({
            where: { account_id: accountId },
            include: { role: true },
        });

        if (!account) {
            return null;
        }

        if (account.role?.role_name !== 'Customer') {
            return {
                account,
                customer: null,
                summary: null,
            };
        }

        const customer = await this.prisma.customer.findFirst({
            where: { account_id: accountId },
            select: {
                customer_id: true,
                full_name: true,
                total_points: true,
                account_id: true,
            },
        });

        if (!customer) {
            return {
                account,
                customer: null,
                summary: null,
            };
        }

        const [orderCount, orderTotal] = await Promise.all([
            this.prisma.orders.count({
                where: { customer_id: customer.customer_id },
            }),
            this.prisma.orders.aggregate({
                where: { customer_id: customer.customer_id },
                _sum: { total_amount: true },
            }),
        ]);

        return {
            account,
            customer,
            summary: {
                totalPoints: customer.total_points ?? 0,
                totalOrders: orderCount,
                totalSpent: Number(orderTotal._sum.total_amount ?? 0),
            },
        };
    }
}