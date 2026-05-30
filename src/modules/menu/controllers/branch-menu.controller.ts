import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { BranchMenuService } from '../services/branch-menu.service';
import { CreateBranchMenuDto } from '../dtos/create-branch-menu.dto';
import { UpdateBranchMenuDto } from '../dtos/update-branch-menu.dto';
import { SearchBranchMenuDto } from '../dtos/search-branch-menu.dto';
import { BranchMenuResponseDto } from '../dtos/branch-menu-response.dto';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';
import { PaginationResponseDto } from '../../../common/pagination/dtos/pagination-response.dto';

@ApiTags('branch-menu')
@Controller('branch-menu')
export class BranchMenuController {
    constructor(private readonly branchMenuService: BranchMenuService) {}

    @Post()
    @ApiOperation({ summary: 'Create a branch menu record' })
    @ApiCreatedResponse({ description: 'Branch menu created successfully', type: BranchMenuResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body or validation failed' })
    create(@Body() dto: CreateBranchMenuDto) {
        return this.branchMenuService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all branch menus' })
    @ApiOkResponse({ 
        description: 'List of branch menus', 
        schema: {
            properties: {
                message: { type: 'string', example: 'Branch menus retrieved successfully' },
                data: { type: 'array', items: { $ref: '#/components/schemas/BranchMenuResponseDto' } },
                pagination: { $ref: '#/components/schemas/PaginationResponseDto' }
            }
        } 
    })
    @ApiBadRequestResponse({ description: 'Failed to retrieve branch menus' })
    findAll(@Query() query: PaginationQueryDto) {
        return this.branchMenuService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a branch menu by ID' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Branch menu retrieved successfully', type: BranchMenuResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid branch menu ID' })
    @ApiNotFoundResponse({ description: 'Branch menu not found' })
    findOne(@Param('id') id: string) {
        return this.branchMenuService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a branch menu' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Branch menu updated successfully', type: BranchMenuResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body or branch menu ID' })
    @ApiNotFoundResponse({ description: 'Branch menu not found' })
    update(@Param('id') id: string, @Body() dto: UpdateBranchMenuDto) {
        return this.branchMenuService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a branch menu' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Branch menu deleted successfully' })
    @ApiBadRequestResponse({ description: 'Invalid branch menu ID' })
    @ApiNotFoundResponse({ description: 'Branch menu not found' })
    remove(@Param('id') id: string) {
        return this.branchMenuService.remove(id);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search branch menu by id (name not supported)' })
    @ApiQuery({ name: 'id', required: false })
    @ApiQuery({ name: 'name', required: false })
    @ApiOkResponse({ 
        description: 'Branch menus found successfully', 
        schema: {
            properties: {
                message: { type: 'string', example: 'Branch menu retrieved successfully' },
                data: { type: 'array', items: { $ref: '#/components/schemas/BranchMenuResponseDto' } },
                pagination: { $ref: '#/components/schemas/PaginationResponseDto' }
            }
        } 
    })
    @ApiBadRequestResponse({ description: 'Invalid search parameters' })
    @ApiNotFoundResponse({ description: 'Branch menu not found' })
    search(@Query() query: SearchBranchMenuDto) {
        return this.branchMenuService.search(query);
    }
}
