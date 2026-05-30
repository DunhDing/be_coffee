import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BranchMenuRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(input: { local_price: number; branch_id: string; product_id: string }) {
        return this.prisma.branch_menu.create({
            data: {
                local_price: input.local_price,
                branch_id: input.branch_id,
                product_id: input.product_id,
            },
            include: { product: true, branch: true },
        });
    }

    findAll(skip?: number, take?: number) {
        return this.prisma.branch_menu.findMany({ 
            skip,
            take,
            include: { product: true, branch: true }, 
            orderBy: { id: 'asc' } 
        });
    }

    count() {
        return this.prisma.branch_menu.count();
    }

    findById(id: string) {
        return this.prisma.branch_menu.findUnique({ where: { id }, include: { product: true, branch: true } });
    }

    update(id: string, input: { local_price?: number; branch_id?: string; product_id?: string }) {
        const data: any = {};
        if (input.local_price !== undefined) data.local_price = input.local_price;
        if (input.branch_id !== undefined) data.branch_id = input.branch_id;
        if (input.product_id !== undefined) data.product_id = input.product_id;

        return this.prisma.branch_menu.update({ where: { id }, data, include: { product: true, branch: true } });
    }

    delete(id: string) {
        return this.prisma.branch_menu.delete({ where: { id } });
    }
}
