import { ApiProperty } from '@nestjs/swagger';

export class BranchMenuResponseDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    id!: string;

    @ApiProperty({ example: '12.50' })
    local_price!: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    branch_id?: string | null;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    product_id?: string | null;
}
