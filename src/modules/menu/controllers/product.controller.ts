import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { SearchProductDto } from '../dtos/search-product.dto';
import { ProductResponseDto } from '../dtos/product-response.dto';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';
import { PaginationResponseDto } from '../../../common/pagination/dtos/pagination-response.dto';

@ApiTags('product')
@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new product' })
    @ApiCreatedResponse({ description: 'Product created successfully', type: ProductResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body or validation failed' })
    @ApiConflictResponse({ description: 'Product name already exists' })
    create(@Body() createProductDto: CreateProductDto) {
        return this.productService.create(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products' })
    @ApiOkResponse({ 
        description: 'List of all products', 
        schema: {
            properties: {
                message: { type: 'string', example: 'Products retrieved successfully' },
                data: { type: 'array', items: { $ref: '#/components/schemas/ProductResponseDto' } },
                pagination: { $ref: '#/components/schemas/PaginationResponseDto' }
            }
        } 
    })
    @ApiBadRequestResponse({ description: 'Failed to retrieve products' })
    findAll(@Query() query: PaginationQueryDto) {
        return this.productService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Product retrieved successfully', type: ProductResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid product ID' })
    @ApiNotFoundResponse({ description: 'Product not found' })
    findOne(@Param('id') id: string) {
        return this.productService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a product' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Product updated successfully', type: ProductResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid request body or product ID' })
    @ApiConflictResponse({ description: 'Product name already exists' })
    @ApiNotFoundResponse({ description: 'Product not found' })
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productService.update(id, updateProductDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product' })
    @ApiParam({ name: 'id', type: 'string', example: '' })
    @ApiOkResponse({ description: 'Product deleted successfully' })
    @ApiBadRequestResponse({ description: 'Invalid product ID' })
    @ApiNotFoundResponse({ description: 'Product not found' })
    remove(@Param('id') id: string) {
        return this.productService.remove(id);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search product by name' })
    @ApiQuery({ name: 'name', required: false })
    @ApiOkResponse({ 
        description: 'Products found successfully', 
        schema: {
            properties: {
                message: { type: 'string', example: 'Products retrieved successfully' },
                data: { type: 'array', items: { $ref: '#/components/schemas/ProductResponseDto' } },
                pagination: { $ref: '#/components/schemas/PaginationResponseDto' }
            }
        } 
    })
    @ApiBadRequestResponse({ description: 'Invalid search parameters' })
    @ApiNotFoundResponse({ description: 'Product not found' })
    search(@Query() query: SearchProductDto) {
        return this.productService.search(query);
    }
}
