import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateLoyaltyConfigDto {
    @ApiProperty({ example: 10000, description: 'Amount required to earn 1 point' })
    @IsNotEmpty({ message: 'Earn rate amount is required' })
    @IsInt({ message: 'Earn rate amount must be an integer' })
    @Min(1, { message: 'Earn rate amount must be greater than 0' })
    earn_rate_amount!: number;

    @ApiProperty({ example: 1, description: 'Points earned per earn_rate_amount' })
    @IsNotEmpty({ message: 'Earn rate point is required' })
    @IsInt({ message: 'Earn rate point must be an integer' })
    @Min(1, { message: 'Earn rate point must be greater than 0' })
    earn_rate_point!: number;

    @ApiProperty({ example: 1, description: 'Points required to redeem' })
    @IsNotEmpty({ message: 'Redeem rate point is required' })
    @IsInt({ message: 'Redeem rate point must be an integer' })
    @Min(1, { message: 'Redeem rate point must be greater than 0' })
    redeem_rate_point!: number;

    @ApiProperty({ example: 1000, description: 'Amount received when redeeming redeem_rate_point' })
    @IsNotEmpty({ message: 'Redeem rate amount is required' })
    @IsInt({ message: 'Redeem rate amount must be an integer' })
    @Min(1, { message: 'Redeem rate amount must be greater than 0' })
    redeem_rate_amount!: number;
}
