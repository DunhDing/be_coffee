import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AccountModule } from '../account/account.module';
import { TokenRepository } from './repo/token.repository';
import { CustomerRepository } from '../customer/repo/customer.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    imports: [
        AccountModule,
        JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'dev-secret',
            signOptions: {
                expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRE ?? '100m') as never,
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, TokenRepository, CustomerRepository, PrismaService],
})
export class AuthModule { }
