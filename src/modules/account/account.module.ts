import { Module } from '@nestjs/common';
import { AccountController } from './controllers/account.controller';
import { AccountRepository } from './repo/account.repository';
import { AccountService } from './services/account.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [AccountController],
    providers: [AccountService, AccountRepository, PrismaService],
    exports: [AccountService, PrismaService],
})
export class AccountModule { }
