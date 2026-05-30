import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';

export class SearchBranchMenuDto extends PaginationQueryDto {
    @ApiPropertyOptional({ example: '' })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiPropertyOptional({ example: '' })
    @IsOptional()
    @IsString()
    name?: string;
}
