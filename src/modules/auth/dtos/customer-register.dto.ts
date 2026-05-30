import { ApiProperty } from '@nestjs/swagger';

export class CustomerRegisterDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  name!: string;

  @ApiProperty({ example: '0901234567' })
  phone!: string;

  @ApiProperty({ example: 'P@ssw0rd123' })
  password!: string;

  @ApiProperty({ example: 'email@example.com', required: false })
  email?: string;
}
