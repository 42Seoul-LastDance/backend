import {
    Injectable,
    CanActivate,
    UnauthorizedException,
    ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class Jwt2faGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            console.log('2faJwt: no token');
            throw new UnauthorizedException('2faJwt: no token');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_2FA_SECRET,
            });

            request['authDto'] = payload;
        } catch (error) {
            console.log('2faJwt: token not right');
            throw new UnauthorizedException("2faJwt: can't verify token");
        }
        console.log('2faJwt guard okay');
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}