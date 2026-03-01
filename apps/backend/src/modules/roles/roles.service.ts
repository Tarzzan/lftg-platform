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

  async create(data: { name: string; description?: string }) {
    return this.prisma.role.create({ data });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    await this.findById(id);
    return this.prisma.role.update({ where: { id }, data });
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
