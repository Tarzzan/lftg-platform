import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../apps/backend/src/modules/prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Génération de référence ────────────────────────────────────────────────
  private generateRef(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `MSG-${y}${m}${d}-${rand}`;
  }

  // ─── Créer un message de contact (public) ───────────────────────────────────
  async createMessage(data: {
    senderName: string;
    senderEmail: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    return this.prisma.contactMessage.create({
      data: {
        reference: this.generateRef(),
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        status: 'UNREAD',
      },
    });
  }

  // ─── Lister tous les messages (admin) ───────────────────────────────────────
  async findAll(status?: string) {
    return this.prisma.contactMessage.findMany({
      where: status ? { status } : undefined,
      include: {
        replies: {
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Récupérer un message par ID (admin) ────────────────────────────────────
  async findOne(id: string) {
    const msg = await this.prisma.contactMessage.findUnique({
      where: { id },
      include: {
        replies: {
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!msg) throw new NotFoundException(`Message ${id} introuvable`);
    // Marquer comme lu si UNREAD
    if (msg.status === 'UNREAD') {
      await this.prisma.contactMessage.update({
        where: { id },
        data: { status: 'READ' },
      });
    }
    return msg;
  }

  // ─── Mettre à jour le statut (admin) ────────────────────────────────────────
  async updateStatus(id: string, status: string) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
  }

  // ─── Ajouter une réponse (admin) ────────────────────────────────────────────
  async addReply(messageId: string, authorId: string, content: string) {
    const reply = await this.prisma.contactReply.create({
      data: {
        contactMessageId: messageId,
        authorId,
        content,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    // Marquer le message comme REPLIED
    await this.prisma.contactMessage.update({
      where: { id: messageId },
      data: { status: 'REPLIED' },
    });
    return reply;
  }

  // ─── Supprimer un message (admin) ───────────────────────────────────────────
  async deleteMessage(id: string) {
    await this.prisma.contactMessage.delete({ where: { id } });
    return { deleted: true };
  }

  // ─── Stats (admin) ──────────────────────────────────────────────────────────
  async getStats() {
    const [total, unread, read, replied, archived] = await Promise.all([
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      this.prisma.contactMessage.count({ where: { status: 'READ' } }),
      this.prisma.contactMessage.count({ where: { status: 'REPLIED' } }),
      this.prisma.contactMessage.count({ where: { status: 'ARCHIVED' } }),
    ]);
    return { total, unread, read, replied, archived };
  }
}
