import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateCustomerDto {
    @ApiProperty({ example: '00000000-0000-0000-0000-000000000000' })
    @IsNotEmpty({ message: 'Account ID is required' })
    @IsUUID('4', { message: 'Account ID must be a valid UUID' })
    account_id!: string;

    @ApiProperty({ example: 'Nguyen Van A' })
    @IsNotEmpty({ message: 'Full name is required' })
    @IsString({ message: 'Full name must be a string' })
    full_name!: string;

    @ApiPropertyOptional({ example: '0123456789' })
    @IsOptional()
    @Matches(/^[0-9]{10,11}$/, {
        message: 'Phone number must be 10-11 digits',
    })
    phone_number?: string;

    @ApiPropertyOptional({ example: 'example@gmail.com' })
    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email?: string;
}
