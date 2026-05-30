import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(input: {
        product_name: string;
        description?: string | null;
        image?: string | null;
        category?: string | null;
        price?: number;
        branchIds?: string[];
    }) {
        return this.prisma.product.create({
            data: {
                product_name: input.product_name,
                description: input.description,
                image: input.image,
                category: input.category,
                branch_menu: {
                    create: input.branchIds?.map(id => ({
                        branch_id: id,
                        local_price: input.price ?? 0,
                    })) || []
                }
            },
            include: { branch_menu: true }
        });
    }

    findAll(skip?: number, take?: number) {
        return this.prisma.product.findMany({
            skip,
            take,
            orderBy: { product_id: 'asc' },
            include: { branch_menu: true }
        });
    }

    count() {
        return this.prisma.product.count();
    }

    findById(id: string) {
        return this.prisma.product.findUnique({ 
            where: { product_id: id },
            include: { branch_menu: true } 
        });
    }

    findByName(name: string) {
        return this.prisma.product.findFirst({ where: { product_name: name } });
    }

    searchByName(name: string, skip?: number, take?: number) {
        return this.prisma.product.findMany({
            skip,
            take,
            where: {
                product_name: {
                    contains: name,
                    mode: 'insensitive',
                },
            },
            orderBy: { product_id: 'asc' },
        });
    }

    countByName(name: string) {
        return this.prisma.product.count({
            where: {
                product_name: {
                    contains: name,
                    mode: 'insensitive',
                },
            },
        });
    }

    async update(id: string, input: { product_name?: string; description?: string | null; image?: string | null; category?: string | null; is_available?: boolean; price?: number; branchIds?: string[] }) {
        const data: any = {};
        if (input.product_name !== undefined) data.product_name = input.product_name;
        if (input.description !== undefined) data.description = input.description;
        if (input.image !== undefined) data.image = input.image;
        if (input.category !== undefined) data.category = input.category;
        if (input.is_available !== undefined) data.is_available = input.is_available;

        if (input.branchIds !== undefined) {
            await this.prisma.branch_menu.deleteMany({ where: { product_id: id } });
            if (input.branchIds.length > 0) {
                data.branch_menu = {
                    create: input.branchIds.map(bid => ({
                        branch_id: bid,
                        local_price: input.price ?? 0,
                    }))
                };
            }
        }

        if (Object.keys(data).length === 0) {
            return this.prisma.product.findUnique({
                where: { product_id: id },
                include: { branch_menu: true }
            });
        }

        return this.prisma.product.update({ 
            where: { product_id: id }, 
            data,
            include: { branch_menu: true } 
        });
    }

    delete(id: string) {
        return this.prisma.product.delete({ where: { product_id: id } });
    }
}
