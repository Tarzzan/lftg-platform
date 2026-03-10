// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string, action: string, subject: string, details?: Record<string, any>) {
    return this.prisma.auditLog.create({
      data: { userId, action, subject, details },
    });
  }

  async findAll(filters?: { userId?: string; action?: string; from?: Date; to?: Date }) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.action && { action: { contains: filters.action } }),
        ...(filters?.from || filters?.to
          ? {
              timestamp: {
                ...(filters.from && { gte: filters.from }),
                ...(filters.to && { lte: filters.to }),
              },
            }
          : {}),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { timestamp: 'desc' },
      take: 500,
    });
  }

  @OnEvent('workflow.transitioned')
  async onWorkflowTransition(payload: any) {
    await this.log(
      payload.userId,
      'workflow:transition',
      `WorkflowInstance:${payload.instanceId}`,
      payload,
    );
  }
}
