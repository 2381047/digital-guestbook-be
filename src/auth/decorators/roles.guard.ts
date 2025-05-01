import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/user.entity'; // Adjust path
import { ROLES_KEY } from './roles.decorator';
import { JwtPayloadDto } from '../dto/jwt-payload.dto'; // Adjust path

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      // No roles required, allow access (AuthGuard should already handle authentication)
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayloadDto & { role?: UserRole }; // Get user payload attached by AuthGuard

    if (!user || !user.role) {
      // This shouldn't happen if AuthGuard ran successfully, but good practice to check
      throw new ForbiddenException('User role not found on request');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
