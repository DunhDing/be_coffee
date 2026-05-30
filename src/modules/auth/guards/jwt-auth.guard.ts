import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ErrorCodes } from '../../../common/constants/error-codes';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private readonly jwtService = new JwtService({
        secret: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'dev-secret',
    });

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authorizationHeader = request.headers?.authorization;

        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED,
                message: 'Missing bearer token',
            });
        }

        const token = authorizationHeader.slice(7).trim();

        if (!token) {
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED,
                message: 'Missing bearer token',
            });
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            request.user = payload;
            return true;
        } catch {
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED,
                message: 'Invalid or expired token',
            });
        }
    }
}