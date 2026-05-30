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
    ApiTags,
} from '@nestjs/swagger';
import { BranchService } from '../services/branch.service';
import { CreateBranchDto } from '../dtos/create-branch.dto';
import { UpdateBranchDto } from '../dtos/update-branch.dto';
import { BranchResponseDto } from '../dtos/branch-response.dto';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';
import { PaginationResponseDto } from '../../../common/pagination/dtos/pagination-response.dto';

@ApiTags('branch')
@Controller('branch')
export class BranchController {
    constructor(private readonly branchService: BranchService) { }

    /**
     * Create a new branch
     */
    @Post()
    @ApiOperation({ summary: 'Create a new branch' })
    @ApiBody({ type: CreateBranchDto })
    @ApiCreatedResponse({ description: 'Branch created successfully', type: BranchResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body or validation failed' })
    @ApiConflictResponse({ description: 'Branch name already exists' })
    create(@Body() createBranchDto: CreateBranchDto) {
        return this.branchService.create(createBranchDto);
    }

    /**
     * Get all branches
     */
    @Get()
    @ApiOperation({ summary: 'Get all branches' })
    @ApiOkResponse({ 
        description: 'List of all branches', 
        schema: {
            properties: {
                message: { type: 'string', example: 'Branches found successfully' },
                data: { type: 'array', items: { $ref: '#/components/schemas/BranchResponseDto' } },
                pagination: { $ref: '#/components/schemas/PaginationResponseDto' }
            }
        } 
    })
    @ApiBadRequestResponse({ description: 'Failed to get all branches' })
    findAll(@Query() query: PaginationQueryDto) {
        return this.branchService.findAll(query);
    }

    /**
     * Get a branch by ID
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get a branch by ID' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Branch get by id successfully', type: BranchResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid branch ID' })
    @ApiNotFoundResponse({ description: 'Branch not found' })
    findOne(@Param('id') id: string) {
        return this.branchService.findOne(id);
    }

    /**
     * Update a branch
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update a branch' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiBody({ type: UpdateBranchDto })
    @ApiOkResponse({ description: 'Branch updated successfully', type: BranchResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body or branch ID' })
    @ApiConflictResponse({ description: 'Branch name already exists' })
    @ApiNotFoundResponse({ description: 'Branch not found' })
    update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
        return this.branchService.update(id, updateBranchDto);
    }

    /**
     * Delete a branch
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a branch' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Branch deleted successfully' })
    @ApiBadRequestResponse({ description: 'Invalid branch ID' })
    @ApiNotFoundResponse({ description: 'Branch not found' })
    remove(@Param('id') id: string) {
        return this.branchService.remove(id);
    }
}
