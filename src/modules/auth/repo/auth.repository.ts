import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) { }

    findByUsername(username: string) {
        return this.prisma.account.findUnique({
            where: { username },
        });
    }

    createAccount(username: string, passwordHash: string) {
        return this.prisma.account.create({
            data: {
                username,
                password_hash: passwordHash,
            },
            select: {
                account_id: true,
                username: true,
                role_id: true,
                status: true,
                created_at: true,
            },
        });
    }
}
