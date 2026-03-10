// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
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
    // Extraire uniquement les champs valides pour Prisma (ignorer permissions[])
    const { name, description, permissions } = data;
    const role = await this.prisma.role.create({ data: { name, description } });
    // Si des permissions sont fournies sous forme de tableau d'objets {action, subject}
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
    // Déconnecter les permissions avant de supprimer
    await this.prisma.role.update({
      where: { id },
      data: { permissions: { set: [] } },
    });
    await this.prisma.role.delete({ where: { id } });
    return { deleted: true };
  }

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
}
