import { ApiProperty } from '@nestjs/swagger';

export class RegisterCredentialDto {
    @ApiProperty({ example: 'john_doe' })
    username!: string;

    @ApiProperty({ example: 'P@ssw0rd123' })
    password!: string;
}
