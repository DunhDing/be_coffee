import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './modules/account/account.module';
import { BranchModule } from './modules/branch/branch.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrderModule } from './modules/order/order.module';
import { RoleModule } from './modules/role/role.module';
import { CustomerModule } from './modules/customer/customer.module';
import { MenuModule } from './modules/menu/menu.module';
import { ProductModule } from './modules/menu/product.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { StatisticModule } from './modules/statistic/statistic.module';
import { PaymentModule } from './modules/payment/payment.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';

@Module({
  imports: [BranchModule, OrderModule, AuthModule, AccountModule, RoleModule, CustomerModule, MenuModule, ProductModule, EmployeeModule, StatisticModule, PaymentModule, LoyaltyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
