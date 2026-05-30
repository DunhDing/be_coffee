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
import { EmployeeService } from '../services/employee.service';
import { CreateEmployeeDto } from '../dtos/create-employee.dto';
import { UpdateEmployeeDto } from '../dtos/update-employee.dto';
import { EmployeeResponseDto } from '../dtos/employee-response.dto';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';
import { PaginationResponseDto } from '../../../common/pagination/dtos/pagination-response.dto';

@ApiTags('employee')
@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    /**
     * Create a new employee
     */
    @Post()
    @ApiOperation({ summary: 'Create a new employee' })
    @ApiBody({ type: CreateEmployeeDto })
    @ApiCreatedResponse({ description: 'Employee created successfully', type: EmployeeResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body or validation failed' })
    @ApiConflictResponse({ description: 'Email already exists' })
    create(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.employeeService.createEmployee(createEmployeeDto);
    }

    /**
     * Get all employees
     */
    @Get()
    @ApiOperation({ summary: 'Get all employees' })
    @ApiOkResponse({
        description: 'List of all employees',
        schema: {
            properties: {
                message: { type: 'string', example: 'Employees found successfully' },
                data: { type: 'array', items: { $ref: '#/components/schemas/EmployeeResponseDto' } },
                pagination: { $ref: '#/components/schemas/PaginationResponseDto' },
            },
        },
    })
    @ApiBadRequestResponse({ description: 'Failed to get all employees' })
    findAll(@Query() query: PaginationQueryDto) {
        return this.employeeService.getAllEmployees(query);
    }

    /**
     * Search employees by keyword
     */
    @Get('search')
    @ApiOperation({ summary: 'Search employees by keyword (full_name, phone_number, email)' })
    @ApiQuery({ name: 'keyword', type: 'string', required: true, example: 'Nguyen' })
    @ApiOkResponse({
        description: 'List of matching employees',
        schema: {
            properties: {
                message: { type: 'string', example: 'Employees found successfully' },
                data: { type: 'array', items: { $ref: '#/components/schemas/EmployeeResponseDto' } },
            },
        },
    })
    @ApiBadRequestResponse({ description: 'Search keyword is required' })
    search(@Query('keyword') keyword: string) {
        return this.employeeService.searchEmployees(keyword);
    }

    /**
     * Get an employee by ID
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get an employee by ID' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Employee found successfully', type: EmployeeResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid employee ID' })
    @ApiNotFoundResponse({ description: 'Employee not found' })
    findOne(@Param('id') id: string) {
        return this.employeeService.getEmployeeById(id);
    }

    /**
     * Update an employee
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update an employee' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiBody({ type: UpdateEmployeeDto })
    @ApiOkResponse({ description: 'Employee updated successfully', type: EmployeeResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body or employee ID' })
    @ApiConflictResponse({ description: 'Email already exists' })
    @ApiNotFoundResponse({ description: 'Employee not found' })
    update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        return this.employeeService.updateEmployee(id, updateEmployeeDto);
    }

    /**
     * Delete an employee
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete an employee' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Employee deleted successfully' })
    @ApiBadRequestResponse({ description: 'Invalid employee ID' })
    @ApiNotFoundResponse({ description: 'Employee not found' })
    remove(@Param('id') id: string) {
        return this.employeeService.deleteEmployee(id);
    }
}
