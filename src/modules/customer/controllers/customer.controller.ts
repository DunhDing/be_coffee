import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { CustomerResponseDto } from '../dtos/customer-response.dto';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';
import { PaginationResponseDto } from '../../../common/pagination/dtos/pagination-response.dto';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) {}

    /**
     * Create a new customer
     */
    @Post()
    @ApiOperation({ summary: 'Create a new customer' })
    @ApiBody({ type: CreateCustomerDto })
    @ApiCreatedResponse({ description: 'Customer created successfully', type: CustomerResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body or validation failed' })
    @ApiConflictResponse({ description: 'Phone number or email already exists' })
    create(@Body() createCustomerDto: CreateCustomerDto) {
        return this.customerService.create(createCustomerDto);
    }

    /**
     * Get all customers
     */
    @Get()
    @ApiOperation({ summary: 'Get all customers' })
    @ApiOkResponse({
        description: 'List of all customers',
        schema: {
            properties: {
                message: { type: 'string', example: 'Customers found successfully' },
                data: { type: 'array', items: { $ref: '#/components/schemas/CustomerResponseDto' } },
                pagination: { $ref: '#/components/schemas/PaginationResponseDto' },
            },
        },
    })
    @ApiBadRequestResponse({ description: 'Failed to get all customers' })
    findAll(@Query() query: PaginationQueryDto) {
        return this.customerService.findAll(query);
    }

    /**
     * Search customers by keyword
     */
    @Get('search')
    @ApiOperation({ summary: 'Search customers by keyword (full_name, phone_number, email)' })
    @ApiQuery({ name: 'keyword', type: 'string', required: true, example: 'Nguyen' })
    @ApiOkResponse({
        description: 'List of matching customers',
        schema: {
            properties: {
                message: { type: 'string', example: 'Customers found successfully' },
                data: { type: 'array', items: { $ref: '#/components/schemas/CustomerResponseDto' } },
            },
        },
    })
    @ApiBadRequestResponse({ description: 'Search keyword is required' })
    search(@Query('keyword') keyword: string) {
        return this.customerService.search(keyword);
    }

    /**
     * Get a customer by ID
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get a customer by ID' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Customer found successfully', type: CustomerResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid customer ID' })
    @ApiNotFoundResponse({ description: 'Customer not found' })
    findOne(@Param('id') id: string) {
        return this.customerService.findOne(id);
    }

    /**
     * Update a customer
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update a customer' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiBody({ type: UpdateCustomerDto })
    @ApiOkResponse({ description: 'Customer updated successfully', type: CustomerResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body or customer ID' })
    @ApiConflictResponse({ description: 'Phone number or email already exists' })
    @ApiNotFoundResponse({ description: 'Customer not found' })
    update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
        return this.customerService.update(id, updateCustomerDto);
    }

    /**
     * Delete a customer
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a customer' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Customer deleted successfully' })
    @ApiBadRequestResponse({ description: 'Invalid customer ID' })
    @ApiNotFoundResponse({ description: 'Customer not found' })
    remove(@Param('id') id: string) {
        return this.customerService.remove(id);
    }
}
