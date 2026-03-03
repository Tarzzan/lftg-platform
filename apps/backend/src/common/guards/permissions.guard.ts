import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      { action: string; subject: string }[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Accès refusé');

    // Fetch user roles and permissions from DB
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!userWithRoles) throw new ForbiddenException('Utilisateur introuvable');

    const userPermissions = userWithRoles.roles.flatMap((role) => role.permissions);

    const hasPermission = requiredPermissions.every((required) =>
      userPermissions.some(
        (p) =>
          (p.action === required.action || p.action === 'manage') &&
          (p.subject === required.subject || p.subject === 'all'),
      ),
    );

    if (!hasPermission) {
      throw new ForbiddenException(`Permission requise: ${requiredPermissions.map((p) => `${p.action}:${p.subject}`).join(', ')}`);
    }

    return true;
  }
}
