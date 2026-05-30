import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BranchRepository {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new branch
     */
    create(input: {
        branch_name: string;
        address: string;
        phone_number: string;
        established_date: Date;
        manager_id?: string | null;
        image?: string;
        status?: string;
    }) {
        return this.prisma.branch.create({
            data: {
                branch_name: input.branch_name,
                address: input.address,
                phone_number: input.phone_number,
                established_date: input.established_date,
                image: input.image ?? null,
                status: input.status ?? 'Active',
            },
        });
    }

    /**
     * Find all branches with pagination
     */
    findAll(skip?: number, take?: number) {
        return this.prisma.branch.findMany({
            skip,
            take,
            orderBy: {
                branch_id: 'asc',
            },
            include: {
                _count: {
                    select: {
                        employee: true,
                        orders: {
                            where: { status: 'Pending' }
                        }
                    }
                },
                orders: {
                    where: {
                        status: 'Completed',
                        order_date: {
                            gte: new Date(new Date().setHours(0,0,0,0))
                        }
                    },
                    select: { total_amount: true }
                }
            }
        });
    }

    /**
     * Count all branches
     */
    count() {
        return this.prisma.branch.count();
    }

    /**
     * Find a branch by ID
     */
    findById(branchId: string) {
        return this.prisma.branch.findUnique({
            where: { branch_id: branchId },
        });
    }

    /**
     * Find a branch by name
     */
    findByName(branchName: string) {
        return this.prisma.branch.findFirst({
            where: { branch_name: branchName },
        });
    }

    /**
     * Update a branch
     */
    update(
        branchId: string,
        input: {
            branch_name?: string;
            address?: string;
            phone_number?: string;
            established_date?: Date;
            image?: string;
            status?: string;
        },
    ) {
        const data: any = {};

        if (input.branch_name !== undefined) data.branch_name = input.branch_name;
        if (input.address !== undefined) data.address = input.address;
        if (input.phone_number !== undefined) data.phone_number = input.phone_number;
        if (input.established_date !== undefined) data.established_date = input.established_date;
        if (input.image !== undefined) data.image = input.image;
        if (input.status !== undefined) data.status = input.status;

        return this.prisma.branch.update({
            where: { branch_id: branchId },
            data,
        });
    }

    /**
     * Delete a branch
     */
    delete(branchId: string) {
        return this.prisma.branch.delete({
            where: { branch_id: branchId },
        });
    }
}
