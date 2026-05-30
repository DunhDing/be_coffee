import { ApiProperty } from '@nestjs/swagger';

export class CustomerLoginDto {
  @ApiProperty({ example: '0901234567' })
  phone!: string;

  @ApiProperty({ example: 'P@ssw0rd123' })
  password!: string;
}
