import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { Subject } from 'rxjs';

export interface CrudErrorEvent {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  userId: string | null;
  success: boolean;
  errorMessage: string | null;
  section: string;
  timestamp: Date;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger('MonitoringService');
  private readonly errorStream$ = new Subject<CrudErrorEvent>();

  constructor(private readonly prisma: PrismaService) {}

  get errorStream() {
    return this.errorStream$.asObservable();
  }

  @OnEvent('crud.error.critical')
  @OnEvent('crud.error.warning')
  onCrudError(payload: any) {
    this.errorStream$.next({
      ...payload,
      timestamp: new Date(),
    });
  }

  /**
   * Statistiques globales des 24 dernières heures
   */
  async getStats(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [total, errors, bySection, byMethod, avgDuration, recentErrors] =
      await Promise.all([
        // Total des opérations CRUD
        this.prisma.crudErrorLog.count({ where: { createdAt: { gte: since } } }),

        // Total des erreurs
        this.prisma.crudErrorLog.count({
          where: { createdAt: { gte: since }, success: false },
        }),

        // Erreurs par section
        this.prisma.crudErrorLog.groupBy({
          by: ['section'],
          where: { createdAt: { gte: since }, success: false },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),

        // Opérations par méthode HTTP
        this.prisma.crudErrorLog.groupBy({
          by: ['method'],
          where: { createdAt: { gte: since } },
          _count: { id: true },
          _avg: { duration: true },
        }),

        // Durée moyenne des opérations réussies
        this.prisma.crudErrorLog.aggregate({
          where: { createdAt: { gte: since }, success: true },
          _avg: { duration: true },
        }),

        // 20 dernières erreurs
        this.prisma.crudErrorLog.findMany({
          where: { createdAt: { gte: since }, success: false },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: { select: { name: true, email: true } },
          },
        }),
      ]);

    const successRate = total > 0 ? Math.round(((total - errors) / total) * 100) : 100;

    return {
      period: `${hours}h`,
      total,
      errors,
      successRate,
      avgDuration: Math.round(avgDuration._avg.duration || 0),
      bySection: bySection.map((s) => ({
        section: s.section,
        errors: s._count.id,
      })),
      byMethod: byMethod.map((m) => ({
        method: m.method,
        count: m._count.id,
        avgDuration: Math.round(m._avg.duration || 0),
      })),
      recentErrors: recentErrors.map((e) => ({
        id: e.id,
        method: e.method,
        url: e.url,
        statusCode: e.statusCode,
        duration: e.duration,
        section: e.section,
        errorMessage: e.errorMessage,
        user: e.user,
        timestamp: e.createdAt,
      })),
    };
  }

  /**
   * Historique des erreurs sur 7 jours (pour graphique)
   */
  async getErrorHistory() {
    const days = 7;
    const history = [];

    for (let i = days - 1; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const [total, errors] = await Promise.all([
        this.prisma.crudErrorLog.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        this.prisma.crudErrorLog.count({
          where: { createdAt: { gte: start, lte: end }, success: false },
        }),
      ]);

      history.push({
        date: start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        total,
        errors,
        successRate: total > 0 ? Math.round(((total - errors) / total) * 100) : 100,
      });
    }

    return history;
  }

  /**
   * Générer le rapport quotidien (texte)
   */
  async generateDailyReport(): Promise<string> {
    const stats = await this.getStats(24);
    const history = await this.getErrorHistory();

    const errorsBySection = stats.bySection
      .map((s) => `  • ${s.section} : ${s.errors} erreur(s)`)
      .join('\n') || '  Aucune erreur par section';

    const recentErrorsList = stats.recentErrors
      .slice(0, 5)
      .map(
        (e) =>
          `  [${e.statusCode}] ${e.method} ${e.url}\n    → ${e.errorMessage || 'Erreur inconnue'}\n    → ${new Date(e.timestamp).toLocaleString('fr-FR')}`,
      )
      .join('\n\n') || '  Aucune erreur récente';

    return `
╔══════════════════════════════════════════════════════════════╗
║         RAPPORT QUOTIDIEN — SURVEILLANCE CRUD LFTG          ║
║         ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).padEnd(52)}║
╚══════════════════════════════════════════════════════════════╝

📊 RÉSUMÉ DES 24 DERNIÈRES HEURES
───────────────────────────────────
  Total opérations CRUD : ${stats.total}
  Erreurs détectées     : ${stats.errors}
  Taux de succès        : ${stats.successRate}%
  Durée moyenne         : ${stats.avgDuration}ms

${stats.successRate >= 99 ? '✅ STATUT : EXCELLENT' : stats.successRate >= 95 ? '⚠️  STATUT : ATTENTION REQUISE' : '🚨 STATUT : INTERVENTION NÉCESSAIRE'}

📍 ERREURS PAR SECTION
───────────────────────
${errorsBySection}

🔴 5 DERNIÈRES ERREURS
───────────────────────
${recentErrorsList}

📈 HISTORIQUE 7 JOURS
───────────────────────
${history.map((d) => `  ${d.date.padEnd(12)} : ${d.total} ops, ${d.errors} erreurs (${d.successRate}%)`).join('\n')}

───────────────────────────────────
Rapport généré automatiquement par le système de surveillance LFTG
Tableau de bord : https://lftg.netetfix.fr/admin/monitoring
    `.trim();
  }


  /**
   * Logs detailles des N dernieres heures
   */
  async getLogs(hours = 24, limit = 100, errorsOnly = false) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const where: any = { createdAt: { gte: since } };
    if (errorsOnly) where.success = false;
    const logs = await this.prisma.crudErrorLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    });
    return logs.map((e) => ({
      id: e.id,
      method: e.method,
      url: e.url,
      statusCode: e.statusCode,
      duration: e.duration,
      success: e.success,
      section: e.section,
      errorMessage: e.errorMessage,
      user: e.user,
      timestamp: e.createdAt,
    }));
  }

  /**
   * Nettoyer les logs de plus de 30 jours
   */
  async cleanOldLogs() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deleted = await this.prisma.crudErrorLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    this.logger.log(`Nettoyage : ${deleted.count} anciens logs supprimés`);
    return deleted.count;
  }
}
