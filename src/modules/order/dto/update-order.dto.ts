import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 'Confirmed', enum: ['Pending', 'Confirmed', 'Completed'] })
  status?: string;
}
