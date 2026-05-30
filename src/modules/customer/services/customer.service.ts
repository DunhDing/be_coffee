import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { CustomerRepository } from '../repo/customer.repository';
import { ErrorCodes } from '../../../common/constants/error-codes';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';
import { PaginationUtil } from '../../../common/pagination/utils/pagination.util';
import { PaginatedResult } from '../../../common/pagination/interfaces/paginated-result.interface';
import { CustomerResponseDto } from '../dtos/customer-response.dto';

@Injectable()
export class CustomerService {
    constructor(private readonly customerRepository: CustomerRepository) {}

    private readonly uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    private toResponse(dto: any): CustomerResponseDto {
        const totalOrders = dto.orders ? dto.orders.length : 0;
        const totalSpent = dto.orders 
            ? dto.orders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) 
            : 0;

        let loyaltyTier = 'MEMBER';
        if (totalSpent >= 5000000) loyaltyTier = 'DIAMOND';
        else if (totalSpent >= 3000000) loyaltyTier = 'GOLD';
        else if (totalSpent >= 1000000) loyaltyTier = 'SILVER';

        return {
            customer_id: dto.customer_id,
            full_name: dto.full_name,
            phone_number: dto.phone_number ?? null,
            email: dto.email ?? null,
            total_points: dto.total_points ?? 0,
            account_id: dto.account_id,
            loyaltyTier,
            totalOrders,
            totalSpent,
            joinedAt: dto.account?.created_at ? new Date(dto.account.created_at).toISOString() : new Date().toISOString(),
        };
    }

    /**
     * Create a new customer
     */
    async create(dto: CreateCustomerDto) {
        try {
            if (!dto.account_id) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Account ID is required',
                });
            }

            if (!this.uuidRegex.test(dto.account_id)) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Account ID must be a valid UUID',
                });
            }

            if (!dto.full_name) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Full name is required',
                });
            }

            const account = await this.customerRepository.findAccountById(dto.account_id);
            if (!account) {
                throw new NotFoundException({
                    code: ErrorCodes.ACCOUNT_NOT_FOUND,
                    message: `Account with ID "${dto.account_id}" not found`,
                });
            }

            if (dto.phone_number) {
                const existingByPhone = await this.customerRepository.findByPhone(dto.phone_number);
                if (existingByPhone) {
                    throw new ConflictException({
                        code: ErrorCodes.CUSTOMER_PHONE_ALREADY_EXISTS,
                        message: `Customer with phone number "${dto.phone_number}" already exists`,
                    });
                }
            }

            if (dto.email) {
                const existingByEmail = await this.customerRepository.findByEmail(dto.email);
                if (existingByEmail) {
                    throw new ConflictException({
                        code: ErrorCodes.CUSTOMER_EMAIL_ALREADY_EXISTS,
                        message: `Customer with email "${dto.email}" already exists`,
                    });
                }
            }

            const customer = await this.customerRepository.create({
                account_id: dto.account_id,
                full_name: dto.full_name,
                phone_number: dto.phone_number,
                email: dto.email,
            });

            return {
                message: 'Customer created successfully',
                data: this.toResponse(customer),
            };
        } catch (error) {
            console.error(error);
            if (
                error instanceof ConflictException ||
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to create customer',
            });
        }
    }

    /**
     * Get all customers with pagination
     */
    async findAll(query: PaginationQueryDto): Promise<PaginatedResult<CustomerResponseDto>> {
        try {
            const page = Number(query.page ?? 1);
            const limit = Number(query.limit ?? 10);

            if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Page and limit must be valid integers',
                });
            }

            const skip = PaginationUtil.getSkip(page, limit);

            const [customers, totalItems] = await Promise.all([
                this.customerRepository.findAll(skip, limit),
                this.customerRepository.count(),
            ]);

            return {
                message: 'Customers found successfully',
                data: customers.map((c) => this.toResponse(c)),
                pagination: PaginationUtil.getPaginationMetadata(page, limit, totalItems),
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to retrieve customers',
            });
        }
    }

    /**
     * Search customers by keyword
     */
    async search(keyword: string) {
        try {
            if (!keyword || keyword.trim() === '') {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Search keyword is required',
                });
            }

            const customers = await this.customerRepository.search(keyword.trim());

            return {
                message: 'Customers found successfully',
                data: customers.map((c) => this.toResponse(c)),
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to search customers',
            });
        }
    }

    /**
     * Get a customer by ID
     */
    async findOne(id: string) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Customer ID is required',
                });
            }

            const customer = await this.customerRepository.findById(id);

            if (!customer) {
                throw new NotFoundException({
                    code: ErrorCodes.CUSTOMER_NOT_FOUND,
                    message: `Customer with ID "${id}" not found`,
                });
            }

            return {
                message: 'Customer found successfully',
                data: this.toResponse(customer),
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to retrieve customer',
            });
        }
    }

    /**
     * Update a customer
     */
    async update(id: string, dto: UpdateCustomerDto) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Customer ID is required',
                });
            }

            const existingCustomer = await this.customerRepository.findById(id);
            if (!existingCustomer) {
                throw new NotFoundException({
                    code: ErrorCodes.CUSTOMER_NOT_FOUND,
                    message: `Customer with ID "${id}" not found`,
                });
            }

            if (dto.phone_number && dto.phone_number !== existingCustomer.phone_number) {
                const duplicateByPhone = await this.customerRepository.findByPhone(dto.phone_number);
                if (duplicateByPhone && duplicateByPhone.customer_id !== id) {
                    throw new ConflictException({
                        code: ErrorCodes.CUSTOMER_PHONE_ALREADY_EXISTS,
                        message: `Customer with phone number "${dto.phone_number}" already exists`,
                    });
                }
            }

            if (dto.email && dto.email !== existingCustomer.email) {
                const duplicateByEmail = await this.customerRepository.findByEmail(dto.email);
                if (duplicateByEmail && duplicateByEmail.customer_id !== id) {
                    throw new ConflictException({
                        code: ErrorCodes.CUSTOMER_EMAIL_ALREADY_EXISTS,
                        message: `Customer with email "${dto.email}" already exists`,
                    });
                }
            }

            const customer = await this.customerRepository.update(id, {
                full_name: dto.full_name,
                phone_number: dto.phone_number,
                email: dto.email,
            });

            return {
                message: 'Customer updated successfully',
                data: this.toResponse(customer),
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to update customer',
            });
        }
    }

    /**
     * Delete a customer
     */
    async remove(id: string) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Customer ID is required',
                });
            }

            const existingCustomer = await this.customerRepository.findById(id);
            if (!existingCustomer) {
                throw new NotFoundException({
                    code: ErrorCodes.CUSTOMER_NOT_FOUND,
                    message: `Customer with ID "${id}" not found`,
                });
            }

            await this.customerRepository.delete(id);

            return {
                message: 'Customer deleted successfully',
                data: { customer_id: id },
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to delete customer',
            });
        }
    }
}
