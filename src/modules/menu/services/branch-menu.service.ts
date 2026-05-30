import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BranchMenuRepository } from '../repo/branch-menu.repository';
import { CreateBranchMenuDto } from '../dtos/create-branch-menu.dto';
import { UpdateBranchMenuDto } from '../dtos/update-branch-menu.dto';
import { ErrorCodes } from '../../../common/constants/error-codes';
import { BranchMenuResponseDto } from '../dtos/branch-menu-response.dto';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';
import { PaginationUtil } from '../../../common/pagination/utils/pagination.util';
import { PaginatedResult } from '../../../common/pagination/interfaces/paginated-result.interface';
import { SearchBranchMenuDto } from '../dtos/search-branch-menu.dto';

@Injectable()
export class BranchMenuService {
    constructor(private readonly branchMenuRepository: BranchMenuRepository) {}

    private toResponse(dto: any): BranchMenuResponseDto {
        return {
            id: dto.id,
            local_price: dto.local_price?.toString?.() ?? null,
            branch_id: dto.branch_id ?? null,
            product_id: dto.product_id ?? null,
        };
    }

    async create(dto: CreateBranchMenuDto) {
        try {
            if (!dto.local_price) throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'local_price is required' });
            if (!dto.branch_id) throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'branch_id is required' });
            if (!dto.product_id) throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'product_id is required' });

            const created = await this.branchMenuRepository.create({
                local_price: dto.local_price,
                branch_id: dto.branch_id,
                product_id: dto.product_id,
            });

            return { message: 'Branch menu created successfully', data: this.toResponse(created) };
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to create branch menu' });
        }
    }

    async findAll(query: PaginationQueryDto): Promise<PaginatedResult<BranchMenuResponseDto>> {
        try {
            const { page = 1, limit = 10 } = query;
            const skip = PaginationUtil.getSkip(page, limit);

            const [items, totalItems] = await Promise.all([
                this.branchMenuRepository.findAll(skip, limit),
                this.branchMenuRepository.count(),
            ]);

            return { 
                message: 'Branch menus retrieved successfully', 
                data: items.map((i) => this.toResponse(i)),
                pagination: PaginationUtil.getPaginationMetadata(page, limit, totalItems),
            };
        } catch (error) {
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to retrieve branch menus' });
        }
    }

    async findOne(id: string) {
        try {
            if (!id || id.trim() === '') throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Branch menu ID is required' });

            const found = await this.branchMenuRepository.findById(id);
            if (!found) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: `Branch menu with ID "${id}" not found` });

            return { message: 'Branch menu retrieved successfully', data: this.toResponse(found) };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to retrieve branch menu' });
        }
    }

    async update(id: string, dto: UpdateBranchMenuDto) {
        try {
            if (!id || id.trim() === '') throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Branch menu ID is required' });

            const existing = await this.branchMenuRepository.findById(id);
            if (!existing) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: `Branch menu with ID "${id}" not found` });

            const updated = await this.branchMenuRepository.update(id, {
                local_price: dto.local_price,
                branch_id: dto.branch_id,
                product_id: dto.product_id,
            });

            return { message: 'Branch menu updated successfully', data: this.toResponse(updated) };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to update branch menu' });
        }
    }

    async remove(id: string) {
        try {
            if (!id || id.trim() === '') throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Branch menu ID is required' });

            const existing = await this.branchMenuRepository.findById(id);
            if (!existing) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: `Branch menu with ID "${id}" not found` });

            await this.branchMenuRepository.delete(id);
            return { message: 'Branch menu deleted successfully', data: { id } };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to delete branch menu' });
        }
    }

    async search(query: SearchBranchMenuDto) {
        try {
            const { page = 1, limit = 10 } = query;

            if (query.id) {
                const found = await this.branchMenuRepository.findById(query.id);
                if (!found) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: `Branch menu with ID "${query.id}" not found` });
                
                return { 
                    message: 'Branch menu retrieved successfully', 
                    data: [this.toResponse(found)],
                    pagination: PaginationUtil.getPaginationMetadata(1, limit, 1),
                };
            }

            if (query.name) {
                // model branch_menu has no 'name' field in schema.prisma
                throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Search by name is not supported for branch_menu' });
            }

            return this.findAll({ page, limit });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new BadRequestException({ code: ErrorCodes.BAD_REQUEST, message: 'Failed to search branch menu' });
        }
    }
}
