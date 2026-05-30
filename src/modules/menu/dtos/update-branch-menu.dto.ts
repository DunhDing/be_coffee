import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateBranchMenuDto {
    @ApiPropertyOptional({ example: '' })
    @IsOptional()
    @IsNumber({}, { message: 'local_price must be a number' })
    local_price?: number;

    @ApiPropertyOptional({ example: '' })
    @IsOptional()
    @IsString({ message: 'branch_id must be a string' })
    branch_id?: string;

    @ApiPropertyOptional({ example: '' })
    @IsOptional()
    @IsString({ message: 'product_id must be a string' })
    product_id?: string;
}
