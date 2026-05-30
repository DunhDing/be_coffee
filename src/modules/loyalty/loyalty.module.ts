import { Module } from '@nestjs/common';
import { LoyaltyService } from './services/loyalty.service';
import { LoyaltyController } from './controllers/loyalty.controller';
import { LoyaltyRepository } from './repo/loyalty.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [LoyaltyController],
    providers: [LoyaltyService, LoyaltyRepository, PrismaService],
    exports: [LoyaltyService],
})
export class LoyaltyModule {}
