import { Module } from '@nestjs/common';
import { StatisticController } from './controllers/statistic.controller';
import { StatisticService } from './services/statistic.service';
import { StatisticRepository } from './repo/statistic.repository';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../cache/redis.service';

@Module({
  controllers: [StatisticController],
  providers: [StatisticService, StatisticRepository, PrismaService, RedisService],
  exports: [StatisticService],
})
export class StatisticModule {}
