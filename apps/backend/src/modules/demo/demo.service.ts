import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DemoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Supprime UNIQUEMENT les données de démonstration.
   * Les données réelles (espèces, enclos de base, utilisateurs, vraies ventes, etc.) sont préservées.
   * Stratégie : on supprime les tables qui ne contiennent que des données de démo hardcodées
   * dans le frontend (AgendaEvent, HistoryLog, etc.) et on vide les tables qui
   * pourraient mélanger démo et réel uniquement si elles sont entièrement de démo.
   */
  async clearDemoData(): Promise<{ deleted: Record<string, number> }> {
    const deleted: Record<string, number> = {};

    // Tables entièrement peuplées par des données de démo hardcodées
    // (aucune donnée réelle ne peut y être car elles sont vides en prod)
    const demoOnlyTables = [
      "AgendaEvent",
      "HistoryLog",
      "MlPrediction",
      "IotReading",
      "GpsTrack",
      "Alert",
      "AlertRule",
      "Meal",
      "NutritionPlan",
      "Sponsorship",
      "Sponsor",
    ];

    for (const table of demoOnlyTables) {
      try {
        const result = await (this.prisma as any)[
          table.charAt(0).toLowerCase() + table.slice(1)
        ].deleteMany({});
        deleted[table] = result.count;
      } catch {
        deleted[table] = 0;
      }
    }

    return { deleted };
  }

  async getDemoStatus(): Promise<{ isDemoMode: boolean; demoDataCount: number }> {
    // Vérifie si des données de démo existent en base
    const agendaCount = await this.prisma.agendaEvent.count();
    const historyCount = await this.prisma.historyLog.count();
    const demoDataCount = agendaCount + historyCount;

    return {
      isDemoMode: true, // Toujours vrai jusqu'à ce que le bandeau soit masqué via localStorage
      demoDataCount,
    };
  }
}
