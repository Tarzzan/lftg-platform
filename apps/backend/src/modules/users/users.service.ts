import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, isActive: true, roles: { select: { id: true, name: true } }, teams: { select: { id: true, name: true } }, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { permissions: true } }, teams: true },
    });
    if (!user) throw new NotFoundException(`Utilisateur ${id} introuvable`);
    const { password: _, ...result } = user;
    return result;
  }

  async update(id: string, data: { name?: string; isActive?: boolean }) {
    await this.findById(id);
    return this.prisma.user.update({ where: { id }, data, select: { id: true, email: true, name: true, isActive: true } });
  }

  async assignRoles(userId: string, roleIds: string[]) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { roles: { set: roleIds.map((id) => ({ id })) } },
      include: { roles: true },
    });
  }
}
