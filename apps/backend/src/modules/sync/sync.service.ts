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
  serverVersion: Record<string, unknown>;
  clientVersion: Record<string, unknown>;
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

  /**
   * Synchroniser les opérations hors-ligne d'un client
   */
  async sync(payload: SyncPayload): Promise<SyncResult> {
    this.logger.log(`Sync client ${payload.clientId}: ${payload.operations.length} opérations`);

    const processed: string[] = [];
    const failed: string[] = [];
    const conflicts: SyncConflict[] = [];

    for (const op of payload.operations) {
      try {
        await this.processOperation(op);
        processed.push(op.id);
      } catch (error) {
        this.logger.warn(`Opération échouée ${op.id}: ${error.message}`);
        failed.push(op.id);
      }
    }

    // Récupérer les changements serveur depuis la dernière sync
    const serverChanges = await this.getServerChangesSince(payload.lastSyncAt);

    // Générer un token de sync unique
    const nextSyncToken = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

    return {
      success: failed.length === 0,
      processed: processed.length,
      failed: failed.length,
      conflicts,
      serverChanges,
      nextSyncToken,
    };
  }

  /**
   * Récupérer les changements serveur depuis une date
   */
  async getServerChangesSince(since: string): Promise<ServerChange[]> {
    const sinceDate = new Date(since);
    const changes: ServerChange[] = [];

    // Récupérer les logs d'audit depuis la date de sync
    const auditLogs = await this.prisma.auditLog.findMany({
      where: { createdAt: { gte: sinceDate } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    for (const log of auditLogs) {
      changes.push({
        entity: log.entityType,
        entityId: log.entityId || '',
        type: log.action.includes('CREATE') ? 'CREATE' :
              log.action.includes('DELETE') ? 'DELETE' : 'UPDATE',
        data: log.newValues ? JSON.parse(log.newValues as string) : {},
        updatedAt: log.createdAt.toISOString(),
      });
    }

    return changes;
  }

  /**
   * Traiter une opération de sync
   */
  private async processOperation(op: SyncOperation): Promise<void> {
    this.logger.debug(`Traitement opération: ${op.type} ${op.entity} ${op.entityId}`);

    // Enregistrer l'opération dans les logs d'audit
    await this.prisma.auditLog.create({
      data: {
        action: `SYNC_${op.type}_${op.entity.toUpperCase()}`,
        entityType: op.entity,
        entityId: op.entityId || null,
        newValues: JSON.stringify(op.data),
        userId: op.userId,
      },
    });
  }

  /**
   * Récupérer le statut de sync d'un client
   */
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

  /**
   * Données initiales pour le mode hors-ligne (snapshot)
   */
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
        animals: animals.map(a => ({
          id: a.id,
          name: a.name,
          species: a.species?.name,
          status: a.status,
          enclosureId: a.enclosureId,
        })),
        stockItems: stockItems.map(s => ({
          id: s.id,
          name: s.name,
          quantity: s.quantity,
          unit: s.unit,
          minThreshold: s.minThreshold,
        })),
      },
      ttl: 3600, // 1 heure
    };
  }
}
