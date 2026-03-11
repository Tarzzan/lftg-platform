import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private config: ConfigService,
  ) {}

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

  async create(data: {
    name: string;
    email: string;
    password: string;
    roleIds?: string[];
    isActive?: boolean;
  }) {
    // Vérifier l'unicité de l'email
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        isActive: data.isActive ?? true,
        ...(data.roleIds?.length
          ? { roles: { connect: data.roleIds.map((id) => ({ id })) } }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        roles: { select: { id: true, name: true } },
        createdAt: true,
      },
    });

    // Envoyer l'email de bienvenue avec le mot de passe temporaire
    const appUrl = this.config.get('FRONTEND_URL', 'http://51.210.15.92');
    this.emailService.sendWelcomeEmail({
      recipientEmail: user.email,
      recipientName: user.name,
      temporaryPassword: data.password,
      appUrl,
    }).catch(() => {}); // Ne pas bloquer la création si l'email échoue

    return user;
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
      roleIds?: string[];
    },
  ) {
    await this.findById(id);

    // Vérifier l'unicité de l'email si modifié
    if (data.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Cet email est déjà utilisé par un autre utilisateur');
      }
    }

    // Construire les données Prisma
    const prismaData: any = {};
    if (data.name !== undefined) prismaData.name = data.name;
    if (data.email !== undefined) prismaData.email = data.email;
    if (data.isActive !== undefined) prismaData.isActive = data.isActive;
    if (data.password) {
      prismaData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.roleIds !== undefined) {
      prismaData.roles = { set: data.roleIds.map((rid) => ({ id: rid })) };
    }

    return this.prisma.user.update({
      where: { id },
      data: prismaData,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        roles: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  async assignRoles(userId: string, roleIds: string[]) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { roles: { set: roleIds.map((id) => ({ id })) } },
      include: { roles: true },
    });
  }
}
