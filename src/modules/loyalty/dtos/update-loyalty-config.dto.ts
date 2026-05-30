import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateLoyaltyConfigDto {
    @ApiPropertyOptional({ example: 10000, description: 'Amount required to earn 1 point' })
    @IsOptional()
    @IsInt({ message: 'Earn rate amount must be an integer' })
    @Min(1, { message: 'Earn rate amount must be greater than 0' })
    earn_rate_amount?: number;

    @ApiPropertyOptional({ example: 1, description: 'Points earned per earn_rate_amount' })
    @IsOptional()
    @IsInt({ message: 'Earn rate point must be an integer' })
    @Min(1, { message: 'Earn rate point must be greater than 0' })
    earn_rate_point?: number;

    @ApiPropertyOptional({ example: 1, description: 'Points required to redeem' })
    @IsOptional()
    @IsInt({ message: 'Redeem rate point must be an integer' })
    @Min(1, { message: 'Redeem rate point must be greater than 0' })
    redeem_rate_point?: number;

    @ApiPropertyOptional({ example: 1000, description: 'Amount received when redeeming redeem_rate_point' })
    @IsOptional()
    @IsInt({ message: 'Redeem rate amount must be an integer' })
    @Min(1, { message: 'Redeem rate amount must be greater than 0' })
    redeem_rate_amount?: number;
}
