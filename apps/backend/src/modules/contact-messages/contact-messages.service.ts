// @ts-nocheck
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ContactMessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const ref = "MSG-" + Date.now().toString(36).toUpperCase();
    return this.prisma.contactMessage.create({
      data: {
        reference: ref,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        status: "UNREAD",
      },
    });
  }

  async findAll(status?: string) {
    return this.prisma.contactMessage.findMany({
      where: status ? { status } : undefined,
      include: { replies: { include: { author: { select: { id: true, name: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getStats() {
    const [total, unread, replied, archived] = await Promise.all([
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { status: "UNREAD" } }),
      this.prisma.contactMessage.count({ where: { status: "REPLIED" } }),
      this.prisma.contactMessage.count({ where: { status: "ARCHIVED" } }),
    ]);
    return { total, unread, replied, archived };
  }

  async findOne(id: string) {
    const msg = await this.prisma.contactMessage.findUnique({
      where: { id },
      include: { replies: { include: { author: { select: { id: true, name: true, email: true } } } } },
    });
    if (msg && msg.status === "UNREAD") {
      await this.prisma.contactMessage.update({ where: { id }, data: { status: "READ" } });
    }
    return msg;
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.contactMessage.update({ where: { id }, data: { status } });
  }

  async reply(id: string, data: any) {
    // Trouver le premier admin disponible comme auteur
    const admin = await this.prisma.user.findFirst({ where: { role: "ADMIN" } });
    const authorId = data.authorId ?? admin?.id;
    if (!authorId) throw new Error("Aucun auteur disponible");

    const [reply] = await Promise.all([
      this.prisma.contactReply.create({
        data: { contactMessageId: id, content: data.content, authorId },
        include: { author: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.contactMessage.update({ where: { id }, data: { status: "REPLIED" } }),
    ]);
    return reply;
  }

  async remove(id: string) {
    return this.prisma.contactMessage.delete({ where: { id } });
  }
}
