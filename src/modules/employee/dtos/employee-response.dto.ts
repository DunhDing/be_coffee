import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmployeeResponseDto {
    @ApiProperty({ example: '' })
    employee_id!: string;

    @ApiProperty({ example: 'Nguyen Van A' })
    full_name!: string;

    @ApiPropertyOptional({ example: 'a@gmail.com' })
    email?: string | null;

    @ApiPropertyOptional({ example: '2025-01-01' })
    hire_date?: Date | null;

    @ApiPropertyOptional({ example: '0123456789' })
    phone_number?: string | null;

    @ApiPropertyOptional({ example: '6d1f4d43-7df5-4a6d-9d4b-7a8b4b7e5f1d' })
    account_id?: string | null;

    @ApiPropertyOptional({ example: '38bf394c-36a5-49b9-9c44-1dd075b135ec' })
    branch_id?: string | null;

    @ApiPropertyOptional({ example: true })
    gender?: boolean | null;

    @ApiPropertyOptional({ example: true })
    status?: boolean | null;

    @ApiPropertyOptional()
    account?: any;

    @ApiPropertyOptional()
    branch?: any;

    @ApiPropertyOptional({ example: 'Manager' })
    role?: string | null;
}
