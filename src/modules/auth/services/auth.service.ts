import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AccountService } from '../../account/services/account.service';
import { CustomerRepository } from '../../customer/repo/customer.repository';
import { ErrorCodes } from '../../../common/constants/error-codes';
import { LoginCredentialDto } from '../dtos/login-credential.dto';
import { RegisterCredentialDto } from '../dtos/register-credential.dto';
import { CustomerRegisterDto } from '../dtos/customer-register.dto';
import { CustomerLoginDto } from '../dtos/customer-login.dto';
import { TokenRepository } from '../repo/token.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly accountService: AccountService,
        private readonly jwtService: JwtService,
        private readonly tokenRepository: TokenRepository,
        private readonly customerRepository: CustomerRepository,
        private readonly prisma: PrismaService,
    ) { }

    async register(dto: RegisterCredentialDto) {
        if (!dto.username || !dto.password) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'username and password are required',
            });
        }

        return this.accountService.createAccount(dto);
    }

    async login(dto: LoginCredentialDto) {
        if (!dto.username || !dto.password) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'username and password are required',
            });
        }

        try {
            const account = await this.accountService.findByUsername(dto.username);

            if (!account || !account.password_hash || typeof account.password_hash !== 'string') {
                throw new UnauthorizedException({
                    code: ErrorCodes.INVALID_CREDENTIALS,
                    message: 'Invalid username or password',
                });
            }

            if (account.role?.role_name === 'Customer') {
                throw new UnauthorizedException({
                    code: ErrorCodes.INVALID_CREDENTIALS,
                    message: 'Invalid username or password',
                });
            }

            let isPasswordValid = false;

            try {
                isPasswordValid = await bcrypt.compare(dto.password, account.password_hash);
            } catch {
                throw new UnauthorizedException({
                    code: ErrorCodes.INVALID_CREDENTIALS,
                    message: 'Invalid username or password',
                });
            }

            if (!isPasswordValid) {
                throw new UnauthorizedException({
                    code: ErrorCodes.INVALID_CREDENTIALS,
                    message: 'Invalid username or password',
                });
            }

            const payload = {
                sub: account.account_id,
                username: account.username,
                roleId: account.role_id,
            };

            let accessToken: string;

            try {
                accessToken = await this.jwtService.signAsync(payload);
            } catch {
                throw new InternalServerErrorException({
                    code: ErrorCodes.AUTH_TOKEN_GENERATION_FAILED,
                    message: 'Unable to create access token',
                });
            }

            let refreshToken: string;

            try {
                refreshToken = await this.jwtService.signAsync(payload, {
                    secret: process.env.JWT_REFRESH_TOKEN_SECRET ?? 'dev-refresh-secret',
                    expiresIn: '7d',
                });
            } catch {
                throw new InternalServerErrorException({
                    code: ErrorCodes.AUTH_TOKEN_GENERATION_FAILED,
                    message: 'Unable to create refresh token',
                });
            }

            try {
                await this.tokenRepository.replaceRefreshToken(account.account_id, refreshToken, 7);
            } catch {
                throw new InternalServerErrorException({
                    code: ErrorCodes.INTERNAL_SERVER_ERROR,
                    message: 'Unable to persist refresh token',
                });
            }

            // Get role info
            const roleName = account.role?.role_name ?? 'Staff';

            return {
                code: ErrorCodes.SUCCESS,
                message: 'Login successfully',
                data: {
                    accessToken,
                    refreshToken,
                    user: {
                        id: account.account_id,
                        username: account.username,
                        name: account.username,
                        role: roleName,
                        roleId: account.role_id,
                        branchId: null,
                        avatar: '',
                    },
                },
            };
        } catch (error) {
            console.error('Auth login error:', error);

            if (error instanceof UnauthorizedException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
                throw error;
            }

            throw new InternalServerErrorException({
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                message: error instanceof Error ? error.message : 'Unable to login right now',
            });
        }
    }

    /**
     * Customer Registration — creates account + customer profile
     */
    async customerRegister(dto: CustomerRegisterDto) {
        if (!dto.phone || !dto.password || !dto.name) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'name, phone, and password are required',
            });
        }

        // Check if phone already used as username
        const existingAccount = await this.accountService.findByUsername(dto.phone);
        if (existingAccount) {
            throw new ConflictException({
                code: ErrorCodes.USERNAME_ALREADY_EXISTS,
                message: 'Phone number already registered',
            });
        }

        // Check if customer with this phone exists
        const existingCustomer = await this.customerRepository.findByPhone(dto.phone);
        if (existingCustomer) {
            throw new ConflictException({
                code: ErrorCodes.USERNAME_ALREADY_EXISTS,
                message: 'Phone number already registered',
            });
        }

        // Find "Customer" role
        const customerRole = await this.prisma.role.findFirst({ where: { role_name: 'Customer' } });

        // Create account with phone as username
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const account = await this.prisma.account.create({
            data: {
                username: dto.phone,
                password_hash: passwordHash,
                status: 'Active',
                role_id: customerRole?.role_id ?? null,
            },
        });

        // Create customer profile
        const customer = await this.customerRepository.create({
            account_id: account.account_id,
            full_name: dto.name,
            phone_number: dto.phone,
            email: dto.email,
        });

        // Generate token
        const payload = {
            sub: account.account_id,
            username: account.username,
            customerId: customer.customer_id,
            roleId: account.role_id,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            code: ErrorCodes.SUCCESS,
            message: 'Registration successful',
            data: {
                accessToken,
                customer: {
                    id: customer.customer_id,
                    name: customer.full_name,
                    phone: customer.phone_number,
                    email: customer.email ?? '',
                    loyaltyTier: 'Bronze',
                    totalOrders: 0,
                    totalSpent: 0,
                    points: customer.total_points ?? 0,
                    joinedAt: new Date().toISOString(),
                },
            },
        };
    }

    /**
     * Customer Login — login by phone+password
     */
    async customerLogin(dto: CustomerLoginDto) {
        if (!dto.phone || !dto.password) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'phone and password are required',
            });
        }

        const account = await this.accountService.findByUsername(dto.phone);
        if (!account) {
            throw new UnauthorizedException({
                code: ErrorCodes.INVALID_CREDENTIALS,
                message: 'Invalid phone or password',
            });
        }

        if (account.role?.role_name !== 'Customer') {
            throw new UnauthorizedException({
                code: ErrorCodes.INVALID_CREDENTIALS,
                message: 'Invalid phone or password',
            });
        }

        const isPasswordValid = await bcrypt.compare(dto.password, account.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedException({
                code: ErrorCodes.INVALID_CREDENTIALS,
                message: 'Invalid phone or password',
            });
        }

        // Get customer profile
        const customer = await this.customerRepository.findByPhone(dto.phone);
        if (!customer) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Customer profile not found',
            });
        }

        const payload = {
            sub: account.account_id,
            username: account.username,
            customerId: customer.customer_id,
            roleId: account.role_id,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        // Determine loyalty tier based on points
        const points = customer.total_points ?? 0;
        const loyaltyTier =
            points >= 1000 ? 'Diamond' :
                points >= 500 ? 'Gold' :
                    points >= 200 ? 'Silver' : 'Bronze';

        return {
            code: ErrorCodes.SUCCESS,
            message: 'Login successful',
            data: {
                accessToken,
                customer: {
                    id: customer.customer_id,
                    name: customer.full_name,
                    phone: customer.phone_number,
                    email: customer.email ?? '',
                    loyaltyTier,
                    totalOrders: 0,
                    totalSpent: 0,
                    points,
                    joinedAt: new Date().toISOString(),
                },
            },
        };
    }

    /**
     * GET /auth/me — returns user info from JWT
     */
    async getMe(accountId: string) {
        const account = await this.prisma.account.findUnique({
            where: { account_id: accountId },
            include: { role: true },
        });

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        return {
            code: ErrorCodes.SUCCESS,
            message: 'Account info retrieved',
            data: {
                id: account.account_id,
                username: account.username,
                name: account.username,
                role: account.role?.role_name ?? 'Staff',
                roleId: account.role_id,
                branchId: null,
                avatar: '',
            },
        };
    }
}
