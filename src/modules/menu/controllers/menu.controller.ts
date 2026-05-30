import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * /menu — Public endpoint for customers to see available products by branch
 * Returns products in the format the FE customer expects:
 * { id, name, category, description, price, image, isAvailable, availableBranchIds }
 */
@ApiTags('menu')
@Controller('menu')
export class MenuController {
    constructor(private readonly prisma: PrismaService) {}

    @Get()
    @ApiOperation({ summary: 'Get menu products with branch availability' })
    @ApiQuery({ name: 'branchId', required: false, type: String })
    async getMenu(@Query('branchId') branchId?: string) {
        // Get all branch_menu entries with product info
        const branchMenus = await this.prisma.branch_menu.findMany({
            include: {
                product: true,
                branch: true,
            },
        });

        // Group by product_id to aggregate branch availability
        const productMap = new Map<string, any>();

        for (const bm of branchMenus) {
            if (!bm.product) continue;
            const pid = bm.product.product_id;

            if (!productMap.has(pid)) {
                productMap.set(pid, {
                    id: pid,
                    name: bm.product.product_name,
                    category: bm.product.category ?? 'Coffee',
                    description: bm.product.description ?? '',
                    price: Number(bm.local_price),
                    image: bm.product.image ?? '',
                    isAvailable: bm.product.is_available ?? true,
                    availableBranchIds: [],
                });
            }

            const product = productMap.get(pid);
            if (bm.branch_id) {
                product.availableBranchIds.push(bm.branch_id);
            }
            // Use the local price of the requested branch if applicable
            if (branchId && bm.branch_id === branchId) {
                product.price = Number(bm.local_price);
            }
        }

        let products = Array.from(productMap.values());

        // Filter by branchId if provided
        if (branchId) {
            products = products.filter((p) => p.availableBranchIds.includes(branchId));
        }

        return {
            message: 'Menu retrieved successfully',
            data: products,
        };
    }
}
