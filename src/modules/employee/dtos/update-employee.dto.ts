import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, IsBoolean, IsDateString } from 'class-validator';

export class UpdateEmployeeDto {
    @ApiPropertyOptional({ example: 'Nguyen Van B' })
    @IsOptional()
    @IsString({ message: 'Full name must be a string' })
    full_name?: string;

    @ApiPropertyOptional({ example: 'b@gmail.com' })
    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email?: string;

    @ApiPropertyOptional({ example: '0999999999' })
    @IsOptional()
    @IsString({ message: 'Phone number must be a string' })
    phone_number?: string;

    @ApiPropertyOptional({ example: '2025-02-01' })
    @IsOptional()
    @IsDateString({}, { message: 'Hire date must be a valid date string (YYYY-MM-DD)' })
    hire_date?: string;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean({ message: 'Gender must be a boolean' })
    gender?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean({ message: 'Status must be a boolean' })
    status?: boolean;

    @ApiPropertyOptional({ example: '6d1f4d43-7df5-4a6d-9d4b-7a8b4b7e5f1d' })
    @IsOptional()
    @IsUUID('4', { message: 'Account ID must be a valid UUID' })
    account_id?: string;

    @ApiPropertyOptional({ example: '38bf394c-36a5-49b9-9c44-1dd075b135ec' })
    @IsOptional()
    @IsUUID('4', { message: 'Branch ID must be a valid UUID' })
    branch_id?: string;

    @ApiPropertyOptional({ example: 'Manager' })
    @IsOptional()
    @IsString()
    role?: string;
}
