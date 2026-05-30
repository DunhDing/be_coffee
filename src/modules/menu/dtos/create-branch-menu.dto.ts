import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBranchMenuDto {
    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'local_price is required' })
    @IsNumber({}, { message: 'local_price must be a number' })
    local_price!: number;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'branch_id is required' })
    @IsString({ message: 'branch_id must be a string' })
    branch_id!: string;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'product_id is required' })
    @IsString({ message: 'product_id must be a string' })
    product_id!: string;
}
