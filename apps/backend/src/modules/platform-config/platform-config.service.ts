import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PlatformConfig {
  // IA
  aiEnabled: boolean;
  llmModel: string;
  llmProvider: string;
  aiPersonality: string;
  openaiApiKey: string;
  // Plateforme
  platformName: string;
  platformSiret: string;
  platformEmail: string;
  platformPhone: string;
  platformAddress: string;
  platformWebsite: string;
  // Notifications
  notifEmail: boolean;
  notifPush: boolean;
  notifSms: boolean;
}

const DEFAULTS: PlatformConfig = {
  aiEnabled: true,
  llmModel: 'gpt-4o',
  llmProvider: 'openai',
  aiPersonality: 'pedagogique',
  openaiApiKey: '',
  platformName: 'La Ferme Tropicale de Guyane',
  platformSiret: '',
  platformEmail: '',
  platformPhone: '',
  platformAddress: '',
  platformWebsite: 'https://lftg.info',
  notifEmail: true,
  notifPush: true,
  notifSms: false,
};

@Injectable()
export class PlatformConfigService {
  private readonly logger = new Logger(PlatformConfigService.name);
  // Cache en mémoire pour éviter des requêtes DB répétées
  private cache: Partial<PlatformConfig> = {};
  private cacheLoaded = false;

  constructor(private readonly prisma: PrismaService) {}

  private async ensureTable() {
    // Utilise une table générique KeyValue si disponible, sinon stocke dans un fichier JSON
    try {
      await this.prisma.$queryRaw`SELECT 1 FROM "PlatformConfig" LIMIT 1`;
    } catch {
      // Table n'existe pas encore — on utilise le stockage en mémoire + fichier
    }
  }

  async getAll(): Promise<PlatformConfig> {
    if (this.cacheLoaded) {
      return { ...DEFAULTS, ...this.cache };
    }
    try {
      // Essayer de lire depuis la DB via une table générique
      const rows = await this.prisma.$queryRaw<{ key: string; value: string }[]>`
        SELECT key, value FROM 'PlatformConfig'
      `;
      const config: Partial<PlatformConfig> = {};
      for (const row of rows) {
        try {
          (config as any)[row.key] = JSON.parse(row.value);
        } catch {
          (config as any)[row.key] = row.value;
        }
      }
      this.cache = config;
      this.cacheLoaded = true;
      return { ...DEFAULTS, ...config };
    } catch {
      // Table n'existe pas encore — retourner les defaults
      this.cacheLoaded = true;
      return { ...DEFAULTS };
    }
  }

  async update(updates: Partial<PlatformConfig>): Promise<PlatformConfig> {
    // Masquer la clé API dans les logs
    const logSafe = { ...updates };
    if (logSafe.openaiApiKey) logSafe.openaiApiKey = 'sk-***';
    this.logger.log(`Mise à jour config plateforme: ${JSON.stringify(logSafe)}`);

    try {
      for (const [key, value] of Object.entries(updates)) {
        const serialized = JSON.stringify(value);
        await this.prisma.$executeRaw`
          INSERT INTO "PlatformConfig" (key, value, 'updatedAt")
          VALUES (${key}, ${serialized}, NOW())
          ON CONFLICT (key) DO UPDATE SET value = ${serialized}, "updatedAt" = NOW()
        `;
      }
    } catch {
      // Table n'existe pas — stocker uniquement en cache mémoire
      this.logger.warn('Table PlatformConfig non disponible, stockage en mémoire uniquement');
    }

    // Mettre à jour le cache
    this.cache = { ...this.cache, ...updates };

    // Si une clé OpenAI est fournie, mettre à jour la variable d'environnement en runtime
    if (updates.openaiApiKey && updates.openaiApiKey.startsWith('sk-')) {
      process.env.OPENAI_API_KEY = updates.openaiApiKey;
      this.logger.log('Clé API OpenAI mise à jour en runtime');
    }
    if (updates.llmModel) {
      process.env.LLM_MODEL = updates.llmModel;
    }

    return this.getAll();
  }

  async getAiConfig(): Promise<{ apiKey: string; model: string; personality: string; enabled: boolean }> {
    const config = await this.getAll();
    return {
      apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY || '',
      model: config.llmModel,
      personality: config.aiPersonality,
      enabled: config.aiEnabled,
    };
  }

  // Masque la clé API pour l'affichage frontend (ne retourne que les 8 derniers caractères)
  maskApiKey(key: string): string {
    if (!key || key.length < 10) return '';
    return 'sk-' + '•'.repeat(Math.max(0, key.length - 11)) + key.slice(-8);
  }
}
