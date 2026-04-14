import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-admin-key'];
    const expected = process.env.ADMIN_API_KEY;

    if (!expected) {
      throw new ForbiddenException('Admin access not configured');
    }

    if (apiKey !== expected) {
      throw new ForbiddenException('Invalid admin key');
    }

    return true;
  }
}
