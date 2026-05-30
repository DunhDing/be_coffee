import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateBranchDto } from '../dtos/create-branch.dto';
import { UpdateBranchDto } from '../dtos/update-branch.dto';
import { BranchRepository } from '../repo/branch.repository';
import { ErrorCodes } from '../../../common/constants/error-codes';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';
import { PaginationUtil } from '../../../common/pagination/utils/pagination.util';
import { PaginatedResult } from '../../../common/pagination/interfaces/paginated-result.interface';
import { BranchResponseDto } from '../dtos/branch-response.dto';

@Injectable()
export class BranchService {
    constructor(private readonly branchRepository: BranchRepository) { }

    private toResponse(dto: any): BranchResponseDto {
        return {
            branch_id: dto.branch_id,
            branch_name: dto.branch_name,
            address: dto.address ?? '',
            phone_number: dto.phone_number ?? '',
            established_date: dto.established_date ?? new Date(),
            image: dto.image ?? '',
            status: dto.status ?? 'Active',
            employeeCount: dto._count?.employee ?? 0,
            activeOrders: dto._count?.orders ?? 0,
            revenueToday: dto.orders?.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) ?? 0,
            created_at: dto.created_at,
            updated_at: dto.updated_at,
        };
    }

    /**
     * Create a new branch
     */
    async create(dto: CreateBranchDto) {
        try {
            // Validate required fields
            if (!dto.branch_name || !dto.address || !dto.phone_number || !dto.established_date) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'All required fields must be provided',
                });
            }

            // Check if branch name already exists
            const existingBranch = await this.branchRepository.findByName(dto.branch_name);
            if (existingBranch) {
                throw new ConflictException({
                    code: ErrorCodes.BRANCH_NAME_ALREADY_EXISTS,
                    message: `Branch with name "${dto.branch_name}" already exists`,
                });
            }

            const branch = await this.branchRepository.create({
                branch_name: dto.branch_name,
                address: dto.address,
                phone_number: dto.phone_number,
                established_date: new Date(dto.established_date),
                image: dto.image,
                status: dto.status,
            });

            return {
                message: 'Branch created successfully',
                data: branch,
            };
        } catch (error) {
            console.error(error);
            if (error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to create branch',
            });
        }
    }

    /**
     * Get all branches
     */
    async findAll(query: PaginationQueryDto): Promise<PaginatedResult<BranchResponseDto>> {
        try {
            const { page = 1, limit = 10 } = query;
            const skip = PaginationUtil.getSkip(page, limit);

            const [branches, totalItems] = await Promise.all([
                this.branchRepository.findAll(skip, limit),
                this.branchRepository.count(),
            ]);

            return {
                message: 'Branches found successfully',
                data: branches.map((b) => this.toResponse(b)),
                pagination: PaginationUtil.getPaginationMetadata(page, limit, totalItems),
            };
        } catch (error) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to retrieve branches',
            });
        }
    }

    /**
     * Get a branch by ID
     */
    async findOne(id: string) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Branch ID is required',
                });
            }

            const branch = await this.branchRepository.findById(id);

            if (!branch) {
                throw new NotFoundException({
                    code: ErrorCodes.BRANCH_NOT_FOUND,
                    message: `Branch with ID "${id}" not found`,
                });
            }

            return {
                message: 'Branch found successfully',
                data: branch,
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to retrieve branch',
            });
        }
    }

    /**
     * Update a branch
     */
    async update(id: string, dto: UpdateBranchDto) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Branch ID is required',
                });
            }

            // Check if branch exists
            const existingBranch = await this.branchRepository.findById(id);
            if (!existingBranch) {
                throw new NotFoundException({
                    code: ErrorCodes.BRANCH_NOT_FOUND,
                    message: `Branch with ID "${id}" not found`,
                });
            }

            // If updating branch_name, check if new name already exists
            if (dto.branch_name && dto.branch_name !== existingBranch.branch_name) {
                const duplicateBranch = await this.branchRepository.findByName(dto.branch_name);
                if (duplicateBranch && duplicateBranch.branch_id !== id) {
                    throw new ConflictException({
                        code: ErrorCodes.BRANCH_NAME_ALREADY_EXISTS,
                        message: `Branch with name "${dto.branch_name}" already exists`,
                    });
                }
            }

            const updateData: {
                branch_name?: string;
                address?: string;
                phone_number?: string;
                established_date?: Date;
                image?: string;
                status?: string;
            } = {
                branch_name: dto.branch_name,
                address: dto.address,
                phone_number: dto.phone_number,
                image: dto.image,
                status: dto.status,
            };

            if (dto.established_date !== undefined) {
                updateData.established_date = new Date(dto.established_date);
            }

            const branch = await this.branchRepository.update(id, updateData);

            return {
                message: 'Branch updated successfully',
                data: branch,
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to update branch',
            });
        }
    }

    /**
     * Delete a branch
     */
    async remove(id: string) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Branch ID is required',
                });
            }

            // Check if branch exists
            const existingBranch = await this.branchRepository.findById(id);
            if (!existingBranch) {
                throw new NotFoundException({
                    code: ErrorCodes.BRANCH_NOT_FOUND,
                    message: `Branch with ID "${id}" not found`,
                });
            }

            await this.branchRepository.delete(id);

            return {
                message: 'Branch deleted successfully',
                data: { branch_id: id },
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to delete branch',
            });
        }
    }
}
