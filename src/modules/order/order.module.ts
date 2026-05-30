import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [LoyaltyModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, PrismaService],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}
