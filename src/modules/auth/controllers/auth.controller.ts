import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginCredentialDto } from '../dtos/login-credential.dto';
import { RegisterCredentialDto } from '../dtos/register-credential.dto';
import { CustomerRegisterDto } from '../dtos/customer-register.dto';
import { CustomerLoginDto } from '../dtos/customer-login.dto';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register with username and password (admin/staff)' })
    @ApiBody({ type: RegisterCredentialDto })
    @ApiOkResponse({ description: 'Account created successfully' })
    @ApiConflictResponse({ description: 'Username already exists' })
    @ApiBadRequestResponse({ description: 'Invalid request body' })
    register(@Body() dto: RegisterCredentialDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Admin/Staff login with username and password' })
    @ApiBody({ type: LoginCredentialDto })
    @ApiOkResponse({ description: 'Login successful and JWT returned' })
    @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
    @ApiBadRequestResponse({ description: 'Invalid request body' })
    login(@Body() dto: LoginCredentialDto) {
        return this.authService.login(dto);
    }

    @Post('customer/register')
    @ApiOperation({ summary: 'Customer registration with phone and password' })
    @ApiBody({ type: CustomerRegisterDto })
    @ApiOkResponse({ description: 'Customer registered successfully' })
    @ApiConflictResponse({ description: 'Phone already registered' })
    @ApiBadRequestResponse({ description: 'Invalid request body' })
    customerRegister(@Body() dto: CustomerRegisterDto) {
        return this.authService.customerRegister(dto);
    }

    @Post('customer/login')
    @ApiOperation({ summary: 'Customer login with phone and password' })
    @ApiBody({ type: CustomerLoginDto })
    @ApiOkResponse({ description: 'Login successful and JWT returned' })
    @ApiUnauthorizedResponse({ description: 'Invalid phone or password' })
    @ApiBadRequestResponse({ description: 'Invalid request body' })
    customerLogin(@Body() dto: CustomerLoginDto) {
        return this.authService.customerLogin(dto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user info (pass accountId as query for now)' })
    @ApiQuery({ name: 'accountId', type: String, required: true })
    @ApiOkResponse({ description: 'User info returned' })
    getMe(@Query('accountId') accountId: string) {
        return this.authService.getMe(accountId);
    }
}
