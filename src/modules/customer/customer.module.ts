import { Module } from '@nestjs/common';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';
import { CustomerRepository } from './repo/customer.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [CustomerController],
    providers: [CustomerService, CustomerRepository, PrismaService],
    exports: [CustomerService],
})
export class CustomerModule {}
