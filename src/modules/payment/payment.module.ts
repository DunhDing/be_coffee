import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
    imports: [LoyaltyModule],
    controllers: [PaymentController],
    providers: [PaymentService, PaymentRepository, PrismaService],
})
export class PaymentModule { }
