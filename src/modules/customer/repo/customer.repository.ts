import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerRepository {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new customer
     */
    create(input: {
        account_id: string;
        full_name: string;
        phone_number?: string;
        email?: string;
    }) {
        return this.prisma.customer.create({
            data: {
                full_name: input.full_name,
                phone_number: input.phone_number,
                email: input.email,
                total_points: 0,
                account_id: input.account_id,
            },
            select: {
                customer_id: true,
                full_name: true,
                phone_number: true,
                email: true,
                total_points: true,
                account_id: true,
            },
        });
    }

    /**
     * Find an account by ID before linking it to a customer
     */
    findAccountById(accountId: string) {
        return this.prisma.account.findUnique({
            where: { account_id: accountId },
            select: {
                account_id: true,
            },
        });
    }

    /**
     * Find all customers with pagination
     */
    findAll(skip?: number, take?: number) {
        return this.prisma.customer.findMany({
            skip,
            take,
            orderBy: {
                full_name: 'asc',
            },
            select: {
                customer_id: true,
                full_name: true,
                phone_number: true,
                email: true,
                total_points: true,
                account_id: true,
                account: { select: { created_at: true } },
                orders: { where: { status: 'Completed' }, select: { total_amount: true } },
            },
        });
    }

    /**
     * Count all customers
     */
    count() {
        return this.prisma.customer.count();
    }

    /**
     * Find a customer by ID
     */
    findById(customerId: string) {
        return this.prisma.customer.findUnique({
            where: { customer_id: customerId },
            select: {
                customer_id: true,
                full_name: true,
                phone_number: true,
                email: true,
                total_points: true,
                account_id: true,
                account: { select: { created_at: true } },
                orders: { where: { status: 'Completed' }, select: { total_amount: true } },
            },
        });
    }

    /**
     * Find a customer by email
     */
    findByEmail(email: string) {
        return this.prisma.customer.findFirst({
            where: { email },
            select: {
                customer_id: true,
                full_name: true,
                phone_number: true,
                email: true,
                total_points: true,
                account_id: true,
            },
        });
    }

    /**
     * Find a customer by phone number
     */
    findByPhone(phoneNumber: string) {
        return this.prisma.customer.findFirst({
            where: { phone_number: phoneNumber },
            select: {
                customer_id: true,
                full_name: true,
                phone_number: true,
                email: true,
                total_points: true,
                account_id: true,
            },
        });
    }

    /**
     * Search customers by keyword (full_name, email, phone_number)
     */
    search(keyword: string) {
        return this.prisma.customer.findMany({
            where: {
                OR: [
                    {
                        full_name: {
                            contains: keyword,
                            mode: 'insensitive',
                        },
                    },
                    {
                        email: {
                            contains: keyword,
                            mode: 'insensitive',
                        },
                    },
                    {
                        phone_number: {
                            contains: keyword,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            select: {
                customer_id: true,
                full_name: true,
                phone_number: true,
                email: true,
                total_points: true,
                account_id: true,
                account: { select: { created_at: true } },
                orders: { where: { status: 'Completed' }, select: { total_amount: true } },
            },
        });
    }

    /**
     * Update a customer
     */
    update(
        customerId: string,
        input: {
            full_name?: string;
            phone_number?: string;
            email?: string;
        },
    ) {
        const data: {
            full_name?: string;
            phone_number?: string;
            email?: string;
        } = {};

        if (input.full_name !== undefined) data.full_name = input.full_name;
        if (input.phone_number !== undefined) data.phone_number = input.phone_number;
        if (input.email !== undefined) data.email = input.email;

        return this.prisma.customer.update({
            where: { customer_id: customerId },
            data,
            select: {
                customer_id: true,
                full_name: true,
                phone_number: true,
                email: true,
                total_points: true,
                account_id: true,
            },
        });
    }

    /**
     * Delete a customer
     */
    delete(customerId: string) {
        return this.prisma.customer.delete({
            where: { customer_id: customerId },
        });
    }
}
