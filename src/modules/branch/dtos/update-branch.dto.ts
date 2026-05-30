import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
} from 'class-validator';

export class UpdateBranchDto {
    @ApiPropertyOptional({ example: '' })
    @IsOptional()
    @IsString({ message: 'Branch name must be a string' })
    branch_name?: string;

    @ApiPropertyOptional({ example: '' })
    @IsOptional()
    @IsString({ message: 'Address must be a string' })
    address?: string;

    @ApiPropertyOptional({ example: '' })
    @IsOptional()
    @Matches(/^[0-9]{10,11}$/, {
        message: 'Phone number must be 10-11 digits',
    })
    phone_number?: string;

    @ApiPropertyOptional({ example: '2024-01-15' })
    @IsOptional()
    @IsDateString(
        {},
        {
            message: 'Established date must be a valid date (YYYY-MM-DD)',
        },
    )
    established_date?: string;

    @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional({ example: 'Active' })
    @IsOptional()
    @IsString()
    status?: string;
}
