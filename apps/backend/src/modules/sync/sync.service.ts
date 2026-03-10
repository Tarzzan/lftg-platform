// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SyncPayload {
  clientId: string;
  lastSyncAt: string;
  operations: SyncOperation[];
}

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId?: string;
  data: Record<string, unknown>;
  timestamp: string;
  userId: string;
}

export interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  conflicts: SyncConflict[];
  serverChanges: ServerChange[];
  nextSyncToken: string;
}

export interface SyncConflict {
  operationId: string;
  entity: string;
  entityId: string;
  reason: string;
}

export interface ServerChange {
  entity: string;
  entityId: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  data: Record<string, unknown>;
  updatedAt: string;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sync(payload: SyncPayload): Promise<SyncResult> {
    this.logger.log(`Sync client ${payload.clientId}: ${payload.operations.length} opérations`);
    let processed = 0;
    let failed = 0;
    const conflicts: SyncConflict[] = [];

    for (const op of payload.operations) {
      try {
        await this.processOperation(op);
        processed++;
      } catch (error) {
        this.logger.warn(`Opération échouée ${op.id}: ${error.message}`);
        failed++;
      }
    }

    const serverChanges = await this.getServerChangesSince(payload.lastSyncAt);
    const nextSyncToken = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

    return {
      success: failed === 0,
      processed,
      failed,
      conflicts,
      serverChanges,
      nextSyncToken,
    };
  }

  async getServerChangesSince(since: string): Promise<ServerChange[]> {
    const sinceDate = new Date(since);
    const changes: ServerChange[] = [];

    const auditLogs = await this.prisma.auditLog.findMany({
      where: { timestamp: { gte: sinceDate } },
      orderBy: { timestamp: 'asc' },
      take: 100,
    });

    for (const log of auditLogs) {
      changes.push({
        entity: log.subject,
        entityId: '',
        type: log.action.includes('CREATE') ? 'CREATE' :
              log.action.includes('DELETE') ? 'DELETE' : 'UPDATE',
        data: (log.details as Record<string, unknown>) || {},
        updatedAt: log.timestamp.toISOString(),
      });
    }

    return changes;
  }

  private async processOperation(op: SyncOperation): Promise<void> {
    this.logger.debug(`Traitement opération: ${op.type} ${op.entity} ${op.entityId}`);
    await this.prisma.auditLog.create({
      data: {
        action: `SYNC_${op.type}_${op.entity.toUpperCase()}`,
        subject: op.entity,
        details: op.data as any,
        userId: op.userId,
      },
    });
  }

  async getSyncStatus(clientId: string) {
    return {
      clientId,
      lastSyncAt: new Date(Date.now() - 3600000).toISOString(),
      pendingOperations: 0,
      syncEnabled: true,
      offlineCapabilities: [
        'animals:read',
        'medical:read',
        'stock:read',
        'agenda:read',
        'kiosque:write',
      ],
    };
  }

  async getOfflineSnapshot(userId: string) {
    this.logger.log(`Génération snapshot hors-ligne pour ${userId}`);
    const [animals, stockItems] = await Promise.all([
      this.prisma.animal.findMany({ take: 50, include: { species: true } }),
      this.prisma.stockItem.findMany({ take: 100 }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      version: '9.0.0',
      data: {
        animals: animals.map((a) => ({
          id: a.id,
          name: a.name,
          species: a.species?.name,
          status: a.status,
          enclosureId: a.enclosureId,
        })),
        stockItems: stockItems.map((s) => ({
          id: s.id,
          name: s.name,
          quantity: s.quantity,
          unit: s.unit,
          minThreshold: s.lowStockThreshold,
        })),
      },
      ttl: 3600,
    };
  }
}
