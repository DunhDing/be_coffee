import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    product_id!: string;

    @ApiProperty({ example: 'Caffeine Latte' })
    product_name!: string;

    @ApiPropertyOptional({ example: 'Delicious coffee with milk' })
    description?: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/image.png' })
    image?: string | null;

    @ApiPropertyOptional({ example: true })
    is_available?: boolean | null;

    @ApiPropertyOptional({ example: 45000 })
    price?: number;

    @ApiPropertyOptional({ example: 'Coffee' })
    category?: string | null;

    @ApiPropertyOptional({ example: ['branch-1'] })
    availableBranchIds?: string[];
}
