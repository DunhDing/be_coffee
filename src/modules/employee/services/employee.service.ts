import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from '../dtos/create-employee.dto';
import { UpdateEmployeeDto } from '../dtos/update-employee.dto';
import { EmployeeRepository } from '../repo/employee.repository';
import { ErrorCodes } from '../../../common/constants/error-codes';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';
import { PaginationUtil } from '../../../common/pagination/utils/pagination.util';
import { PaginatedResult } from '../../../common/pagination/interfaces/paginated-result.interface';
import { EmployeeResponseDto } from '../dtos/employee-response.dto';

@Injectable()
export class EmployeeService {
    constructor(private readonly employeeRepository: EmployeeRepository) {}

    private toResponse(dto: any): EmployeeResponseDto {
        return {
            employee_id: dto.employee_id,
            full_name: dto.full_name,
            email: dto.email ?? null,
            hire_date: dto.hire_date ?? null,
            phone_number: dto.phone_number ?? null,
            account_id: dto.account_id ?? null,
            branch_id: dto.branch_id ?? null,
            gender: dto.gender ?? null,
            status: dto.status ?? null,
            role: dto.role ?? null,
            account: dto.account ?? null,
            branch: dto.branch ?? null,
        };
    }

    /**
     * Create a new employee
     */
    async createEmployee(dto: CreateEmployeeDto) {
        try {
            if (!dto.full_name) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Full name is required',
                });
            }

            if (dto.email) {
                const existingByEmail = await this.employeeRepository.findByEmail(dto.email);
                if (existingByEmail) {
                    throw new ConflictException({
                        code: ErrorCodes.CONFLICT,
                        message: `Employee with email "${dto.email}" already exists`,
                    });
                }
            }

            const employee = await this.employeeRepository.create({
                full_name: dto.full_name,
                email: dto.email,
                phone_number: dto.phone_number,
                hire_date: dto.hire_date ? new Date(dto.hire_date) : undefined,
                gender: dto.gender,
                status: dto.status,
                account_id: dto.account_id,
                branch_id: dto.branch_id,
                role_name: dto.role,
            });

            return {
                message: 'Employee created successfully',
                data: this.toResponse(employee),
            };
        } catch (error) {
            console.error(error);
            if (error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to create employee',
            });
        }
    }

    /**
     * Get all employees
     */
    async getAllEmployees(query: PaginationQueryDto): Promise<PaginatedResult<EmployeeResponseDto>> {
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

            const [employees, totalItems] = await Promise.all([
                this.employeeRepository.findAll(skip, limit),
                this.employeeRepository.count(),
            ]);

            return {
                message: 'Employees found successfully',
                data: employees.map((e) => this.toResponse(e)),
                pagination: PaginationUtil.getPaginationMetadata(page, limit, totalItems),
            };
        } catch (error) {
            console.error("==== EMPLOYEE ERROR ====", error);
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to retrieve employees',
            });
        }
    }

    /**
     * Search employees
     */
    async searchEmployees(keyword: string) {
        try {
            if (!keyword || keyword.trim() === '') {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Search keyword is required',
                });
            }

            const employees = await this.employeeRepository.search(keyword.trim());

            return {
                message: 'Employees found successfully',
                data: employees.map((e) => this.toResponse(e)),
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to search employees',
            });
        }
    }

    /**
     * Get an employee by ID
     */
    async getEmployeeById(id: string) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Employee ID is required',
                });
            }

            const employee = await this.employeeRepository.findById(id);

            if (!employee) {
                throw new NotFoundException({
                    code: ErrorCodes.NOT_FOUND,
                    message: `Employee with ID "${id}" not found`,
                });
            }

            return {
                message: 'Employee found successfully',
                data: this.toResponse(employee),
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to retrieve employee',
            });
        }
    }

    /**
     * Update an employee
     */
    async updateEmployee(id: string, dto: UpdateEmployeeDto) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Employee ID is required',
                });
            }

            const existingEmployee = await this.employeeRepository.findById(id);
            if (!existingEmployee) {
                throw new NotFoundException({
                    code: ErrorCodes.NOT_FOUND,
                    message: `Employee with ID "${id}" not found`,
                });
            }

            if (dto.email && dto.email !== existingEmployee.email) {
                const duplicateByEmail = await this.employeeRepository.findByEmail(dto.email);
                if (duplicateByEmail && duplicateByEmail.employee_id !== id) {
                    throw new ConflictException({
                        code: ErrorCodes.CONFLICT,
                        message: `Employee with email "${dto.email}" already exists`,
                    });
                }
            }

            const updateData: {
                full_name?: string;
                email?: string;
                phone_number?: string;
                hire_date?: Date;
                gender?: boolean;
                status?: boolean;
                account_id?: string;
                branch_id?: string;
                role_name?: string;
            } = {
                full_name: dto.full_name,
                email: dto.email,
                phone_number: dto.phone_number,
                gender: dto.gender,
                status: dto.status,
                account_id: dto.account_id,
                branch_id: dto.branch_id,
                role_name: dto.role,
            };

            if (dto.hire_date !== undefined) {
                updateData.hire_date = dto.hire_date ? new Date(dto.hire_date) : undefined;
            }

            const employee = await this.employeeRepository.update(id, updateData);

            return {
                message: 'Employee updated successfully',
                data: this.toResponse(employee),
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
                message: 'Failed to update employee',
            });
        }
    }

    /**
     * Delete an employee
     */
    async deleteEmployee(id: string) {
        try {
            if (!id || id.trim() === '') {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Employee ID is required',
                });
            }

            const existingEmployee = await this.employeeRepository.findById(id);
            if (!existingEmployee) {
                throw new NotFoundException({
                    code: ErrorCodes.NOT_FOUND,
                    message: `Employee with ID "${id}" not found`,
                });
            }

            await this.employeeRepository.delete(id);

            return {
                message: 'Employee deleted successfully',
                data: { employee_id: id },
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Failed to delete employee',
            });
        }
    }
}
