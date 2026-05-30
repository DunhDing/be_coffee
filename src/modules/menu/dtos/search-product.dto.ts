import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';

export class SearchProductDto extends PaginationQueryDto {
    @ApiPropertyOptional({ example: '' })
    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    name?: string;
}
