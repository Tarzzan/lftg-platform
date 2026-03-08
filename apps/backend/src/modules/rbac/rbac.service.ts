import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, CreatePermissionDto } from './dto/rbac.dto';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  async findAllRoles() {
    return this.prisma.role.findMany({ include: { permissions: true } });
  }

  async findRoleById(id: string) {
    return this.prisma.role.findUnique({ where: { id }, include: { permissions: true } });
  }

  async createRole(dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissionIds
          ? { connect: dto.permissionIds.map(id => ({ id })) }
          : undefined,
      },
      include: { permissions: true },
    });
  }

  async deleteRole(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany();
  }

  async createPermission(dto: CreatePermissionDto) {
    return this.prisma.permission.create({ data: dto });
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { permissions: true } },
      },
    });
    if (!user) return [];
    const permissions = user.roles.flatMap(r => r.permissions);
    return [...new Map(permissions.map(p => [p.id, p])).values()];
  }
}
