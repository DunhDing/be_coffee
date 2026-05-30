import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { CreateLoyaltyConfigDto } from '../dtos/create-loyalty-config.dto';
import { EarnPointDto } from '../dtos/earn-point.dto';
import { RedeemPointDto } from '../dtos/redeem-point.dto';
import { UpdateLoyaltyConfigDto } from '../dtos/update-loyalty-config.dto';
import { LoyaltyService } from '../services/loyalty.service';

@ApiTags('loyalty')
@Controller('loyalty')
export class LoyaltyController {
    constructor(private readonly loyaltyService: LoyaltyService) {}

    @Get('config')
    @ApiOperation({ summary: 'Get loyalty config list' })
    @ApiOkResponse({ description: 'Loyalty configs found successfully' })
    getConfigs() {
        return this.loyaltyService.getConfigs();
    }

    @Get('config/:id')
    @ApiOperation({ summary: 'Get loyalty config detail' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiOkResponse({ description: 'Loyalty config found successfully' })
    @ApiNotFoundResponse({ description: 'Loyalty config not found' })
    getConfigById(@Param('id') id: string) {
        return this.loyaltyService.getConfigById(id);
    }

    @Get('preview')
    @ApiOperation({ summary: 'Preview points earned and discount' })
    @ApiQuery({ name: 'customerId', required: false })
    @ApiQuery({ name: 'totalAmount', type: 'number' })
    @ApiQuery({ name: 'usePoints', type: 'boolean', required: false })
    async calculatePointsPreview(
        @Query('totalAmount') totalAmount: string,
        @Query('customerId') customerId?: string,
        @Query('usePoints') usePoints?: string,
    ) {
        const amount = Number(totalAmount) || 0;
        const useP = usePoints === 'true';
        const data = await this.loyaltyService.calculatePointsPreview(customerId, amount, useP);
        return {
            message: 'Preview calculated successfully',
            data,
        };
    }

    @Post('config')
    @ApiOperation({ summary: 'Create loyalty config' })
    @ApiBody({ type: CreateLoyaltyConfigDto })
    @ApiCreatedResponse({ description: 'Loyalty config created successfully' })
    @ApiBadRequestResponse({ description: 'Invalid request body' })
    createConfig(@Body() dto: CreateLoyaltyConfigDto) {
        return this.loyaltyService.createConfig(dto);
    }

    @Patch('config/:id')
    @ApiOperation({ summary: 'Update loyalty config' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiBody({ type: UpdateLoyaltyConfigDto })
    @ApiOkResponse({ description: 'Loyalty config updated successfully' })
    @ApiNotFoundResponse({ description: 'Loyalty config not found' })
    @ApiBadRequestResponse({ description: 'Invalid request body' })
    updateConfig(@Param('id') id: string, @Body() dto: UpdateLoyaltyConfigDto) {
        return this.loyaltyService.updateConfig(id, dto);
    }

    @Delete('config/:id')
    @ApiOperation({ summary: 'Delete loyalty config' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiOkResponse({ description: 'Loyalty config deleted successfully' })
    @ApiNotFoundResponse({ description: 'Loyalty config not found' })
    deleteConfig(@Param('id') id: string) {
        return this.loyaltyService.deleteConfig(id);
    }

    @Post('earn')
    @ApiOperation({ summary: 'Earn points from order' })
    @ApiBody({ type: EarnPointDto })
    @ApiCreatedResponse({ description: 'Points earned successfully' })
    @ApiNotFoundResponse({ description: 'Customer, order, or config not found' })
    @ApiBadRequestResponse({ description: 'Invalid earn request' })
    earnPoints(@Body() dto: EarnPointDto) {
        return this.loyaltyService.earnPoints(dto);
    }

    @Post('redeem')
    @ApiOperation({ summary: 'Redeem customer points' })
    @ApiBody({ type: RedeemPointDto })
    @ApiCreatedResponse({ description: 'Points redeemed successfully' })
    @ApiNotFoundResponse({ description: 'Customer or order not found' })
    @ApiBadRequestResponse({ description: 'Insufficient points or invalid request' })
    redeemPoints(@Body() dto: RedeemPointDto) {
        return this.loyaltyService.redeemPoints(dto);
    }

    @Get('customer/:customerId')
    @ApiOperation({ summary: 'Get customer loyalty profile' })
    @ApiParam({ name: 'customerId', type: 'string' })
    @ApiOkResponse({ description: 'Customer loyalty profile found successfully' })
    @ApiNotFoundResponse({ description: 'Customer not found' })
    getCustomerProfile(@Param('customerId') customerId: string) {
        return this.loyaltyService.getCustomerProfile(customerId);
    }

    @Get('history/:customerId')
    @ApiOperation({ summary: 'Get customer loyalty history' })
    @ApiParam({ name: 'customerId', type: 'string' })
    @ApiOkResponse({ description: 'Customer loyalty history found successfully' })
    @ApiNotFoundResponse({ description: 'Customer not found' })
    getCustomerHistory(@Param('customerId') customerId: string) {
        return this.loyaltyService.getCustomerHistory(customerId);
    }

    @Get('report/tier-distribution')
    @ApiOperation({ summary: 'Get tier distribution report' })
    @ApiOkResponse({ description: 'Tier distribution found successfully' })
    getTierDistribution() {
        return this.loyaltyService.getTierDistribution();
    }

    @Get('report/retention')
    @ApiOperation({ summary: 'Get retention rate report' })
    @ApiOkResponse({ description: 'Retention rate found successfully' })
    getRetentionRate() {
        return this.loyaltyService.getRetentionRate();
    }

    @Get('report/top-customers')
    @ApiOperation({ summary: 'Get top loyalty customers' })
    @ApiOkResponse({ description: 'Top loyalty customers found successfully' })
    getTopCustomers() {
        return this.loyaltyService.getTopCustomers();
    }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get loyalty dashboard' })
    @ApiOkResponse({ description: 'Loyalty dashboard found successfully' })
    getDashboard() {
        return this.loyaltyService.getDashboard();
    }
}
