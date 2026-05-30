import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDto {
    @ApiProperty({ example: 'john_doe' })
    username!: string;

    @ApiProperty({ example: 'P@ssw0rd123' })
    password!: string;

    @ApiPropertyOptional({ example: 'Active', description: 'Account status' })
    status?: string;

    @ApiPropertyOptional({
        example: '6d1f4d43-7df5-4a6d-9d4b-7a8b4b7e5f1d',
        description: 'Role id assigned to the account',
    })
    roleId?: string;
}