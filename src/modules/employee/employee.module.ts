import { Module } from '@nestjs/common';
import { EmployeeService } from './services/employee.service';
import { EmployeeController } from './controllers/employee.controller';
import { EmployeeRepository } from './repo/employee.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [EmployeeController],
    providers: [EmployeeService, EmployeeRepository, PrismaService],
    exports: [EmployeeService],
})
export class EmployeeModule {}
