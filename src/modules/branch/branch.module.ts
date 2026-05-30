import { Module } from '@nestjs/common';
import { BranchService } from './services/branch.service';
import { BranchController } from './controllers/branch.controller';
import { BranchRepository } from './repo/branch.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BranchController],
  providers: [BranchService, BranchRepository, PrismaService],
  exports: [BranchService],
})
export class BranchModule {}
