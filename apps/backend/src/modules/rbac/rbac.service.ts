import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, CreatePermissionDto, SetPermissionsDto } from './dto/rbac.dto';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  async findAllRoles() {
    return this.prisma.role.findMany({ include: { permissions: true } });
  }

  async findRoleById(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id }, include: { permissions: true } });
    if (!role) throw new NotFoundException(`Rôle ${id} introuvable`);
    return role;
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

  /**
   * Remplace l'ensemble des permissions d'un rôle par la liste fournie.
   * Idempotent : peut être appelé plusieurs fois avec le même résultat.
   */
  async setPermissions(roleId: string, dto: SetPermissionsDto) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Rôle ${roleId} introuvable`);

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: dto.permissionIds.map(id => ({ id })),
        },
      },
      include: { permissions: true },
    });
  }

  /**
   * Ajoute une permission à un rôle si elle n'y est pas déjà, la retire sinon.
   * Retourne le rôle mis à jour avec le champ `toggled` indiquant l'opération effectuée.
   */
  async togglePermission(roleId: string, permissionId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });
    if (!role) throw new NotFoundException(`Rôle ${roleId} introuvable`);

    const permission = await this.prisma.permission.findUnique({ where: { id: permissionId } });
    if (!permission) throw new NotFoundException(`Permission ${permissionId} introuvable`);

    const alreadyHas = role.permissions.some(p => p.id === permissionId);

    const updated = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: alreadyHas
          ? { disconnect: { id: permissionId } }
          : { connect: { id: permissionId } },
      },
      include: { permissions: true },
    });

    return { ...updated, toggled: alreadyHas ? 'removed' : 'added' };
  }

  /**
   * Ajoute une permission à un rôle (sans retirer les autres).
   */
  async addPermission(roleId: string, permissionId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Rôle ${roleId} introuvable`);

    return this.prisma.role.update({
      where: { id: roleId },
      data: { permissions: { connect: { id: permissionId } } },
      include: { permissions: true },
    });
  }

  /**
   * Retire une permission d'un rôle.
   */
  async removePermission(roleId: string, permissionId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Rôle ${roleId} introuvable`);

    return this.prisma.role.update({
      where: { id: roleId },
      data: { permissions: { disconnect: { id: permissionId } } },
      include: { permissions: true },
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({ orderBy: [{ subject: 'asc' }, { action: 'asc' }] });
  }

  async createPermission(dto: CreatePermissionDto) {
    // Vérifier l'unicité action+subject
    const existing = await this.prisma.permission.findFirst({
      where: { action: dto.action, subject: dto.subject },
    });
    if (existing) throw new ConflictException(`La permission ${dto.subject}:${dto.action} existe déjà`);

    return this.prisma.permission.create({ data: dto });
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { permissions: true } },
      },
    });
    if (!user) throw new NotFoundException(`Utilisateur ${userId} introuvable`);
    const permissions = user.roles.flatMap(r => r.permissions);
    return [...new Map(permissions.map(p => [p.id, p])).values()];
  }
}
