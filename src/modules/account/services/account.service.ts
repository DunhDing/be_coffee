import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ErrorCodes } from '../../../common/constants/error-codes';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { AccountRepository } from '../repo/account.repository';

@Injectable()
export class AccountService {
    constructor(private readonly accountRepository: AccountRepository) { }

    async createAccount(dto: CreateAccountDto) {
        if (!dto.username || !dto.password) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'username and password are required',
            });
        }

        const existingAccount = await this.accountRepository.findByUsername(dto.username);

        if (existingAccount) {
            throw new ConflictException({
                code: ErrorCodes.USERNAME_ALREADY_EXISTS,
                message: 'Username already exists',
            });
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const account = await this.accountRepository.createAccount({
            username: dto.username,
            passwordHash,
            status: dto.status,
            roleId: dto.roleId,
        });

        return {
            message: 'Account created successfully',
            data: account,
        };
    }

    findByUsername(username: string) {
        return this.accountRepository.findByUsername(username);
    }

    async getCustomerSummary(accountId: string) {
        if (!accountId || accountId.trim() === '') {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'accountId is required',
            });
        }

        const result = await this.accountRepository.getCustomerAccountSummary(accountId);

        if (!result) {
            throw new NotFoundException({
                code: ErrorCodes.ACCOUNT_NOT_FOUND,
                message: `Account with ID "${accountId}" not found`,
            });
        }

        if (!result.customer || !result.summary) {
            if (result.account.role?.role_name !== 'Customer') {
                throw new ForbiddenException({
                    code: ErrorCodes.FORBIDDEN,
                    message: 'Account does not have Customer role',
                });
            }

            throw new NotFoundException({
                code: ErrorCodes.CUSTOMER_NOT_FOUND,
                message: `Customer profile for account "${accountId}" not found`,
            });
        }

        return {
            message: 'Customer summary retrieved successfully',
            data: {
                accountId: result.account.account_id,
                username: result.account.username,
                customerId: result.customer.customer_id,
                customerName: result.customer.full_name,
                role: result.account.role?.role_name ?? null,
                totalPoints: result.summary.totalPoints,
                totalOrders: result.summary.totalOrders,
                totalSpent: result.summary.totalSpent,
            },
        };
    }
}