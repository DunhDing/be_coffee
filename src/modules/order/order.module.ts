import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { RedisService } from '../cache/redis.service';

@Module({
  imports: [LoyaltyModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, PrismaService, RedisService],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}
