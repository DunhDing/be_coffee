import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TokenRepository {
    constructor(private readonly prisma: PrismaService) { }

    async replaceRefreshToken(accountId: string, token: string, daysValid = 7) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + daysValid);

        await this.prisma.token.deleteMany({
            where: { account_id: accountId },
        });

        return this.prisma.token.create({
            data: {
                token,
                expires_at: expiresAt,
                account_id: accountId,
            },
        });
    }
}