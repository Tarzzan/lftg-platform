// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type HistoryEntityType = 'ANIMAL' | 'SPECIES' | 'ENCLOSURE' | 'STOCK_ARTICLE' | 'SALE' | 'USER' | 'MEDICAL_VISIT' | 'WORKFLOW';

export interface HistoryEntry {
  entityType: HistoryEntityType;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  userId: string;
  changes?: Record<string, { before: any; after: any }>;
}

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async record(entry: HistoryEntry): Promise<void> {
    await this.prisma.historyLog.create({
      data: {
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        userId: entry.userId,
        changes: entry.changes ? entry.changes : undefined,
      },
    });
  }

  async getEntityHistory(entityType: string, entityId: string) {
    return this.prisma.historyLog.findMany({
      where: { entityType, entityId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserActivity(userId: string, limit = 50) {
    return this.prisma.historyLog.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecentActivity(limit = 100) {
    return this.prisma.historyLog.findMany({
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async computeDiff(before: Record<string, any>, after: Record<string, any>): Promise<Record<string, { before: any; after: any }>> {
    const changes: Record<string, { before: any; after: any }> = {};
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const key of allKeys) {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changes[key] = { before: before[key], after: after[key] };
      }
    }
    return changes;
  }
}
