import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ProductRepository } from '../repo/product.repository';
import { RedisService } from '../../cache/redis.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ErrorCodes } from '../../../common/constants/error-codes';
import { ProductResponseDto } from '../dtos/product-response.dto';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';
import { PaginationUtil } from '../../../common/pagination/utils/pagination.util';
import { PaginatedResult } from '../../../common/pagination/interfaces/paginated-result.interface';
import { SearchProductDto } from '../dtos/search-product.dto';

@Injectable()
export class ProductService {
    constructor(private readonly productRepository: ProductRepository, private readonly redis: RedisService) { }

    private toResponse(dto: any): ProductResponseDto {
        let price = 0;
        let branchIds: string[] = [];

        if (dto.branch_menu && Array.isArray(dto.branch_menu)) {
            branchIds = dto.branch_menu.map((bm: any) => bm.branch_id);
            if (dto.branch_menu.length > 0) {
                price = Number(dto.branch_menu[0].local_price);
            }
        }

        return {
            product_id: dto.product_id,
            product_name: dto.product_name,
            description: dto.description ?? null,
            image: dto.image ?? null,
            category: dto.category ?? null,
            is_available: dto.is_available ?? true,
            price: price,
            availableBranchIds: branchIds,
        };
    }

    async create(dto: CreateProductDto) {
        try {
            if (!dto.product_name) {
                throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Product name is required' });
            }

            // Check duplicate name
            const existing = await this.productRepository.findByName(dto.product_name);
            if (existing) {
                throw new ConflictException({ code: ErrorCodes.CONFLICT, message: `Product with name "${dto.product_name}" already exists` });
            }

            const product = await this.productRepository.create({
                product_name: dto.product_name,
                description: dto.description ?? null,
                image: dto.image ?? null,
                category: dto.category ?? null,
                price: dto.price,
                branchIds: dto.availableBranchIds,
            });

            // invalidate cache
            await this.redis.del('menu:all');
            return { message: 'Product created successfully', data: this.toResponse(product) };
        } catch (error) {
            if (error instanceof ConflictException || error instanceof BadRequestException) throw error;
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to create product' });
        }
    }

    async findAll(query: PaginationQueryDto): Promise<PaginatedResult<ProductResponseDto>> {
        try {
            const { page = 1, limit = 10 } = query;
            const cacheKey = `product:all:page:${page}:limit:${limit}`;
            
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return cached as PaginatedResult<ProductResponseDto>;
            }

            const skip = PaginationUtil.getSkip(page, limit);

            const [products, totalItems] = await Promise.all([
                this.productRepository.findAll(skip, limit),
                this.productRepository.count(),
            ]);

            const result = {
                message: 'Products retrieved successfully',
                data: products.map((p) => this.toResponse(p)),
                pagination: PaginationUtil.getPaginationMetadata(page, limit, totalItems),
            };

            await this.redis.set(cacheKey, result, 60); // Cache for 60 seconds
            return result;
        } catch (error) {
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to retrieve products' });
        }
    }

    async findOne(id: string) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Product ID is required' });
            }

            const product = await this.productRepository.findById(id);
            if (!product) {
                throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: `Product with ID "${id}" not found` });
            }

            return { message: 'Product retrieved successfully', data: this.toResponse(product) };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to retrieve product' });
        }
    }

    async update(id: string, dto: UpdateProductDto) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Product ID is required' });
            }

            const existing = await this.productRepository.findById(id);
            if (!existing) {
                throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: `Product with ID "${id}" not found` });
            }

            if (dto.product_name && dto.product_name !== existing.product_name) {
                const dup = await this.productRepository.findByName(dto.product_name);
                if (dup && dup.product_id !== id) {
                    throw new ConflictException({ code: ErrorCodes.CONFLICT, message: `Product with name "${dto.product_name}" already exists` });
                }
            }

            const updated = await this.productRepository.update(id, {
                product_name: dto.product_name,
                description: dto.description ?? undefined,
                image: dto.image ?? undefined,
                category: dto.category ?? undefined,
                price: dto.price,
                branchIds: dto.availableBranchIds,
            });

            // invalidate cache
            await this.redis.del('menu:all');

            return { message: 'Product updated successfully', data: this.toResponse(updated) };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) throw error;
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to update product' });
        }
    }

    async remove(id: string) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Product ID is required' });
            }

            const existing = await this.productRepository.findById(id);
            if (!existing) {
                throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: `Product with ID "${id}" not found` });
            }

            await this.productRepository.delete(id);
            // invalidate cache
            await this.redis.del('menu:all');
            return { message: 'Product deleted successfully', data: { product_id: id } };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to delete product' });
        }
    }

    async search(query: SearchProductDto) {
        try {
            const { page = 1, limit = 10 } = query;
            const skip = PaginationUtil.getSkip(page, limit);

            if (query.name) {
                const cacheKey = `product:search:name:${query.name}:page:${page}:limit:${limit}`;
                const cached = await this.redis.get(cacheKey);
                if (cached) return cached as any;

                const [products, totalItems] = await Promise.all([
                    this.productRepository.searchByName(query.name, skip, limit),
                    this.productRepository.countByName(query.name),
                ]);

                const result = {
                    message: 'Products retrieved successfully',
                    data: products.map((p) => this.toResponse(p)),
                    pagination: PaginationUtil.getPaginationMetadata(page, limit, totalItems),
                };

                await this.redis.set(cacheKey, result, 60); // Cache for 60 seconds
                return result;
            }

            // If no name is provided, just return paginated all products (or throw an error)
            return this.findAll({ page, limit });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to search product' });
        }
    }
}
