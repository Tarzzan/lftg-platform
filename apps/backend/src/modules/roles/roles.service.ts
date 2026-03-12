import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({ include: { permissions: true }, orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id }, include: { permissions: true } });
    if (!role) throw new NotFoundException(`Rôle ${id} introuvable`);
    return role;
  }

  async create(data: { name: string; description?: string; permissions?: any[] }) {
    const { name, description, permissions } = data;
    const role = await this.prisma.role.create({ data: { name, description } });
    if (permissions && Array.isArray(permissions) && permissions.length > 0 && permissions[0]?.action) {
      await this.addPermissions(role.id, permissions);
      return this.prisma.role.findUnique({ where: { id: role.id }, include: { permissions: true } });
    }
    return role;
  }

  async update(id: string, data: { name?: string; description?: string }) {
    await this.findById(id);
    return this.prisma.role.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.role.update({
      where: { id },
      data: { permissions: { set: [] } },
    });
    await this.prisma.role.delete({ where: { id } });
    return { deleted: true };
  }

  /**
   * Ajoute des permissions à un rôle (par objets action+subject).
   * Crée les permissions si elles n'existent pas encore.
   */
  async addPermissions(roleId: string, permissions: { action: string; subject: string; conditions?: any }[]) {
    const perms = await Promise.all(
      permissions.map((p) =>
        this.prisma.permission.upsert({
          where: { id: `${p.action}_${p.subject}` },
          update: {},
          create: { id: `${p.action}_${p.subject}`, action: p.action, subject: p.subject, conditions: p.conditions },
        }),
      ),
    );
    return this.prisma.role.update({
      where: { id: roleId },
      data: { permissions: { connect: perms.map((p) => ({ id: p.id })) } },
      include: { permissions: true },
    });
  }

  /**
   * Remplace l'ensemble des permissions d'un rôle par la liste d'IDs fournie.
   * Opération idempotente — peut être appelée plusieurs fois avec le même résultat.
   */
  async setPermissions(roleId: string, permissionIds: string[]) {
    await this.findById(roleId);
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: { set: permissionIds.map((id) => ({ id })) },
      },
      include: { permissions: true },
    });
  }

  /**
   * Bascule une permission sur un rôle (ajoute si absente, retire si présente).
   * Retourne le rôle mis à jour avec le champ `toggled` ('added' | 'removed').
   */
  async togglePermission(roleId: string, permissionId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });
    if (!role) throw new NotFoundException(`Rôle ${roleId} introuvable`);

    const permission = await this.prisma.permission.findUnique({ where: { id: permissionId } });
    if (!permission) throw new NotFoundException(`Permission ${permissionId} introuvable`);

    const alreadyHas = role.permissions.some((p) => p.id === permissionId);

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
   * Ajoute une permission à un rôle par son ID.
   */
  async addPermissionById(roleId: string, permissionId: string) {
    await this.findById(roleId);
    const permission = await this.prisma.permission.findUnique({ where: { id: permissionId } });
    if (!permission) throw new NotFoundException(`Permission ${permissionId} introuvable`);
    return this.prisma.role.update({
      where: { id: roleId },
      data: { permissions: { connect: { id: permissionId } } },
      include: { permissions: true },
    });
  }

  /**
   * Retire une permission d'un rôle par son ID.
   */
  async removePermissionById(roleId: string, permissionId: string) {
    await this.findById(roleId);
    return this.prisma.role.update({
      where: { id: roleId },
      data: { permissions: { disconnect: { id: permissionId } } },
      include: { permissions: true },
    });
  }

  /**
   * Liste toutes les permissions disponibles, triées par ressource puis action.
   */
  async findAllPermissions() {
    return this.prisma.permission.findMany({ orderBy: [{ subject: 'asc' }, { action: 'asc' }] });
  }

  /**
   * Crée une nouvelle permission (vérifie l'unicité action+subject).
   */
  async createPermission(data: { action: string; subject: string; description?: string }) {
    const existing = await this.prisma.permission.findFirst({
      where: { action: data.action, subject: data.subject },
    });
    if (existing) throw new ConflictException(`La permission ${data.subject}:${data.action} existe déjà`);
    return this.prisma.permission.create({ data });
  }
}
