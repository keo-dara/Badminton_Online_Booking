import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';
import { IS_PUBLIC_KEY, IS_SUBSCRIBE_KEY } from './auth.public';
import { Role } from './role.enum';
import { ROLES_KEY } from './decorator/roles.decorator';
import { UsersService } from 'src/users/users.service';
import appConfig from 'src/core/config';
import { SubscriptionService } from 'src/subscription/subscription.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private userService: UsersService,
    private subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: appConfig.jwt.secret,
      });
      request['user'] = payload;
      /// Activate role
      const { user } = context.switchToHttp().getRequest();
      if (!user.role) {
        throw new UnauthorizedException();
      }

      const userInfo = await this.userService.findOne(user.sub);

      if (!userInfo) {
        throw new UnauthorizedException();
      }

      if (userInfo.blockedAt) {
        throw new UnauthorizedException('user is blocked');
      }

      request['user'] = userInfo;

      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      const isRequiredSubscribe = this.reflector.getAllAndOverride<boolean>(
        IS_SUBSCRIBE_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (isRequiredSubscribe === true) {
        const isSub = await this.subscriptionService.isSubscription(user.sub);

        if (!isSub) {
          throw new ForbiddenException('Subscription user only');
        }
      }

      if (!requiredRoles) {
        return true;
      }

      return requiredRoles.some((role) => user.role?.includes(role));
    } catch (e) {
      this.logger.log('Failed to extract token');
      this.logger.log(e);
      if (e.status === 403) {
        throw new ForbiddenException('Subscription user only');
      } else {
        throw new UnauthorizedException();
      }
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
