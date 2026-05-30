import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({ example: 'Caffeine Latte' })
    @IsNotEmpty({ message: 'Product name is required' })
    @IsString({ message: 'Product name must be a string' })
    @MaxLength(100, { message: 'Product name must be at most 100 characters' })
    product_name!: string;

    @ApiPropertyOptional({ example: 'Delicious coffee with milk' })
    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    description?: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/image.png' })
    @IsOptional()
    @IsUrl(undefined, { message: 'Image must be a valid URL' })
    image?: string | null;

    @ApiPropertyOptional({ example: 45000 })
    @IsOptional()
    price?: number;

    @ApiPropertyOptional({ example: 'Coffee' })
    @IsOptional()
    @IsString()
    category?: string | null;

    @ApiPropertyOptional({ example: ['branch-id-1', 'branch-id-2'] })
    @IsOptional()
    availableBranchIds?: string[];
}
