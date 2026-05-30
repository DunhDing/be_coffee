import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmployeeRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Create a new employee
     */
    async create(input: {
        full_name: string;
        email?: string;
        phone_number?: string;
        hire_date?: Date;
        gender?: boolean;
        status?: boolean;
        account_id?: string;
        branch_id?: string;
        role_name?: string;
    }) {
        return this.prisma.employee.create({
            data: {
                full_name: input.full_name,
                email: input.email,
                phone_number: input.phone_number,
                hire_date: input.hire_date,
                gender: input.gender,
                status: input.status,
                account_id: input.account_id || null,
                branch_id: input.branch_id || null,
                role: input.role_name,
            },
            include: {
                account: { include: { role: true } },
                branch: true,
            },
        });
    }

    /**
     * Find all employees with pagination
     */
    findAll(skip?: number, take?: number) {
        return this.prisma.employee.findMany({
            skip,
            take,
            orderBy: {
                full_name: 'asc',
            },
            include: {
                account: { include: { role: true } },
                branch: true,
            },
        });
    }

    /**
     * Count all employees
     */
    count() {
        return this.prisma.employee.count();
    }

    /**
     * Find an employee by ID
     */
    findById(employeeId: string) {
        return this.prisma.employee.findUnique({
            where: { employee_id: employeeId },
            include: {
                account: { include: { role: true } },
                branch: true,
            },
        });
    }

    /**
     * Find an employee by email
     */
    findByEmail(email: string) {
        return this.prisma.employee.findUnique({
            where: { email },
        });
    }

    /**
     * Search employees by keyword (full_name, email, phone_number)
     */
    search(keyword: string) {
        return this.prisma.employee.findMany({
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
            include: {
                account: { include: { role: true } },
                branch: true,
            },
        });
    }

    /**
     * Update an employee
     */
    async update(
        employeeId: string,
        input: {
            full_name?: string;
            email?: string;
            phone_number?: string;
            hire_date?: Date;
            gender?: boolean;
            status?: boolean;
            account_id?: string;
            branch_id?: string;
            role_name?: string;
        },
    ) {
        const data: any = {};

        if (input.full_name !== undefined) data.full_name = input.full_name;
        if (input.email !== undefined) data.email = input.email;
        if (input.phone_number !== undefined) data.phone_number = input.phone_number;
        if (input.hire_date !== undefined) data.hire_date = input.hire_date;
        if (input.gender !== undefined) data.gender = input.gender;
        if (input.status !== undefined) data.status = input.status;
        if (input.account_id !== undefined) data.account_id = input.account_id;
        if (input.branch_id !== undefined) data.branch_id = input.branch_id;
        if (input.role_name !== undefined) data.role = input.role_name;

        return this.prisma.employee.update({
            where: { employee_id: employeeId },
            data,
            include: {
                account: { include: { role: true } },
                branch: true,
            },
        });
    }

    /**
     * Delete an employee
     */
    delete(employeeId: string) {
        return this.prisma.employee.delete({
            where: { employee_id: employeeId },
        });
    }
}
