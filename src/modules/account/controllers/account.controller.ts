import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AccountService } from '../services/account.service';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('account')
@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Post('admin')
    @ApiOperation({ summary: 'Admin create account' })
    @ApiBody({ type: CreateAccountDto })
    @ApiCreatedResponse({ description: 'Account created' })
    @ApiConflictResponse({ description: 'Username already exists' })
    @ApiBadRequestResponse({ description: 'Invalid request body' })
    createAdminAccount(@Body() dto: CreateAccountDto) {
        return this.accountService.createAccount(dto);
    }

    @Get('customer-summary')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get customer summary from JWT' })
    @ApiOkResponse({ description: 'Customer summary returned' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
    @ApiForbiddenResponse({ description: 'Account is not a Customer' })
    @ApiNotFoundResponse({ description: 'Account or customer profile not found' })
    getCustomerSummary(@Req() req: any) {
        const accountId = req.user?.sub;
        return this.accountService.getCustomerSummary(accountId);
    }
}