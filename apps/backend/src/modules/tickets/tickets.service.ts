// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory = 'GENERAL' | 'INFRASTRUCTURE' | 'MEDICAL' | 'FEEDING' | 'SECURITY' | 'EQUIPMENT' | 'STOCK' | 'ANIMAL' | 'OTHER';

export interface CreateTicketDto {
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  assigneeId?: string;
  animalId?: string;
  enclosureId?: string;
  dueDate?: string;
}

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  private async getNextReference(): Promise<string> {
    const count = await this.prisma.ticket.count();
    return `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
  }

  async findAll(filters?: { status?: TicketStatus; priority?: TicketPriority; category?: TicketCategory }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;

    const [tickets, total, open, inProgress, resolved, closed, critical] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
          animal: { select: { id: true, name: true, identifier: true } },
          enclosure: { select: { id: true, name: true } },
          comments: {
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { status: 'OPEN' } }),
      this.prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.ticket.count({ where: { status: 'CLOSED' } }),
      this.prisma.ticket.count({ where: { priority: 'CRITICAL' } }),
    ]);

    const stats = { total, open, inProgress, resolved, closed, critical };
    return { tickets, stats };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        animal: { select: { id: true, name: true, identifier: true } },
        enclosure: { select: { id: true, name: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!ticket) throw new NotFoundException(`Ticket ${id} introuvable`);
    return ticket;
  }

  async create(userId: string, dto: CreateTicketDto) {
    const reference = await this.getNextReference();
    return this.prisma.ticket.create({
      data: {
        reference,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        category: dto.category || 'GENERAL',
        status: 'OPEN',
        createdById: userId,
        ...(dto.assigneeId ? { assigneeId: dto.assigneeId } : {}),
        ...(dto.animalId ? { animalId: dto.animalId } : {}),
        ...(dto.enclosureId ? { enclosureId: dto.enclosureId } : {}),
        ...(dto.dueDate ? { dueDate: new Date(dto.dueDate) } : {}),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        comments: true,
      },
    });
  }

  async updateStatus(id: string, status: TicketStatus) {
    await this.findOne(id);
    return this.prisma.ticket.update({
      where: { id },
      data: {
        status,
        ...(status === 'RESOLVED' || status === 'CLOSED' ? { resolvedAt: new Date() } : {}),
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const { dueDate, ...rest } = data;
    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.ticketComment.deleteMany({ where: { ticketId: id } });
    await this.prisma.ticket.delete({ where: { id } });
    return { deleted: true };
  }

  async addComment(ticketId: string, userId: string, content: string) {
    await this.findOne(ticketId);
    return this.prisma.ticketComment.create({
      data: { ticketId, userId, content },
      include: { user: { select: { id: true, name: true } } },
    });
  }
}
