import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateCustomerDto {
    @ApiPropertyOptional({ example: 'Nguyen Van B' })
    @IsOptional()
    @IsString({ message: 'Full name must be a string' })
    full_name?: string;

    @ApiPropertyOptional({ example: '0987654321' })
    @IsOptional()
    @Matches(/^[0-9]{10,11}$/, {
        message: 'Phone number must be 10-11 digits',
    })
    phone_number?: string;

    @ApiPropertyOptional({ example: 'newemail@gmail.com' })
    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email?: string;
}
