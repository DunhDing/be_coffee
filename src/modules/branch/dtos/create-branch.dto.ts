import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
} from 'class-validator';

export class CreateBranchDto {
    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Branch name is required' })
    @IsString({ message: 'Branch name must be a string' })
    branch_name!: string;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Address is required' })
    @IsString({ message: 'Address must be a string' })
    address!: string;

    @ApiProperty({ example: '' })
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^[0-9]{10,11}$/, {
        message: 'Phone number must be 10-11 digits',
    })
    phone_number!: string;

    @ApiProperty({ example: '2024-01-15' })
    @IsNotEmpty({ message: 'Established date is required' })
    @IsDateString(
        {},
        {
            message: 'Established date must be a valid date (YYYY-MM-DD)',
        },
    )
    established_date!: string;

    @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional({ example: 'Active' })
    @IsOptional()
    @IsString()
    status?: string;
}