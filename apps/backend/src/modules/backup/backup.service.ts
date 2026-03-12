import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = '/home/ubuntu/lftg-backups';
  private readonly platformDir = '/home/ubuntu/lftg-platform';
  private readonly configId = 'default-config';

  constructor(private readonly prisma: PrismaService) {}

  // ─── Configuration ──────────────────────────────────────────────────────────
  async getConfig() {
    const config = await (this.prisma as any).backupConfig.findUnique({
      where: { id: this.configId },
    });
    if (!config) {
      return (this.prisma as any).backupConfig.create({
        data: { id: this.configId },
      });
    }
    return config;
  }

  async updateConfig(data: {
    gdriveEnabled?: boolean;
    gdrivePath?: string;
    localRetentionDays?: number;
    scheduleEnabled?: boolean;
    scheduleHour?: number;
  }) {
    return (this.prisma as any).backupConfig.update({
      where: { id: this.configId },
      data: { ...data, updatedAt: new Date() },
    });
  }

  // ─── Historique ─────────────────────────────────────────────────────────────
  async getHistory(limit = 20) {
    return (this.prisma as any).backupHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ─── Statut Google Drive ─────────────────────────────────────────────────────
  async getGdriveStatus() {
    const config = await this.getConfig();
    let rcloneInstalled = false;
    let connected = false;

    try {
      await execAsync('which rclone');
      rcloneInstalled = true;
      const { stdout } = await execAsync('rclone listremotes 2>/dev/null');
      connected = stdout.includes(`${config.gdriveRemoteName}:`);
    } catch {
      rcloneInstalled = false;
    }

    // Mettre à jour le statut de connexion
    if (connected !== config.gdriveConnected) {
      await (this.prisma as any).backupConfig.update({
        where: { id: this.configId },
        data: { gdriveConnected: connected, updatedAt: new Date() },
      });
    }

    return {
      rcloneInstalled,
      connected,
      remoteName: config.gdriveRemoteName,
      path: config.gdrivePath,
    };
  }

  // ─── Initier la connexion OAuth Google Drive ─────────────────────────────────
  async initiateGdriveOAuth(): Promise<{ authUrl: string; sessionToken: string }> {
    const config = await this.getConfig();

    // Installer rclone si nécessaire
    try {
      await execAsync('which rclone');
    } catch {
      this.logger.log('Installation de rclone...');
      await execAsync('curl -s https://rclone.org/install.sh | sudo bash');
    }

    // Générer un token de session unique
    const sessionToken = crypto.randomBytes(16).toString('hex');

    // Lancer rclone authorize en arrière-plan et capturer l'URL
    const authUrl = await this.getRcloneAuthUrl(config.gdriveRemoteName, sessionToken);

    return { authUrl, sessionToken };
  }

  private async getRcloneAuthUrl(remoteName: string, sessionToken: string): Promise<string> {
    // Créer une config rclone temporaire pour obtenir l'URL OAuth
    const configPath = `/tmp/rclone-oauth-${sessionToken}.conf`;

    try {
      // Créer la config Google Drive sans token (pour obtenir l'URL)
      const configContent = `[${remoteName}]
type = drive
scope = drive
`;
      fs.writeFileSync(configPath, configContent);

      // Obtenir l'URL d'autorisation
      const { stdout, stderr } = await execAsync(
        `rclone authorize "drive" --config ${configPath} 2>&1 || true`,
        { timeout: 5000 }
      );

      const urlMatch = (stdout + stderr).match(/https:\/\/accounts\.google\.com[^\s]*/);
      if (urlMatch) {
        return urlMatch[0];
      }
    } catch (e) {
      this.logger.error('Erreur OAuth rclone:', e.message);
    }

    // URL de fallback : rediriger vers la page de config manuelle
    return `https://accounts.google.com/o/oauth2/auth?client_id=rclone&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/drive&response_type=code&state=${sessionToken}`;
  }

  // ─── Finaliser la connexion avec le code OAuth ────────────────────────────────
  async finalizeGdriveOAuth(authCode: string): Promise<{ success: boolean; message: string }> {
    const config = await this.getConfig();

    try {
      // Configurer rclone avec le code d'autorisation
      const rcloneConfigDir = '/home/ubuntu/.config/rclone';
      fs.mkdirSync(rcloneConfigDir, { recursive: true });

      const configPath = `${rcloneConfigDir}/rclone.conf`;
      const configContent = `[${config.gdriveRemoteName}]
type = drive
scope = drive
token = {"access_token":"${authCode}","token_type":"Bearer","expiry":"0001-01-01T00:00:00Z"}
`;
      // Utiliser rclone config pour créer le remote proprement
      await execAsync(
        `rclone config create ${config.gdriveRemoteName} drive scope drive token '{"access_token":"${authCode}"}' --config ${configPath} 2>/dev/null || true`
      );

      // Vérifier la connexion
      const { stdout } = await execAsync(
        `rclone listremotes --config ${configPath} 2>/dev/null`
      );

      const connected = stdout.includes(`${config.gdriveRemoteName}:`);

      await (this.prisma as any).backupConfig.update({
        where: { id: this.configId },
        data: { gdriveConnected: connected, updatedAt: new Date() },
      });

      return {
        success: connected,
        message: connected ? 'Google Drive connecté avec succès' : 'Connexion non établie',
      };
    } catch (e) {
      this.logger.error('Erreur finalisation OAuth:', e.message);
      return { success: false, message: e.message };
    }
  }

  // ─── Déconnecter Google Drive ─────────────────────────────────────────────────
  async disconnectGdrive(): Promise<void> {
    const config = await this.getConfig();
    try {
      await execAsync(`rclone config delete ${config.gdriveRemoteName} 2>/dev/null || true`);
    } catch {}
    await (this.prisma as any).backupConfig.update({
      where: { id: this.configId },
      data: { gdriveConnected: false, gdriveEnabled: false, updatedAt: new Date() },
    });
  }

  // ─── Lancer un backup ────────────────────────────────────────────────────────
  async triggerBackup(type: 'manual' | 'scheduled' = 'manual'): Promise<{ id: string }> {
    const historyId = crypto.randomBytes(8).toString('hex');
    const startTime = Date.now();

    // Créer l'entrée historique en état "running"
    await (this.prisma as any).backupHistory.create({
      data: {
        id: historyId,
        type,
        status: 'running',
      },
    });

    // Lancer le backup en arrière-plan
    this.runBackup(historyId, startTime).catch((e) => {
      this.logger.error('Erreur backup:', e.message);
    });

    return { id: historyId };
  }

  private async runBackup(historyId: string, startTime: number): Promise<void> {
    const config = await this.getConfig();
    const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);

    fs.mkdirSync(`${this.backupDir}/db`, { recursive: true });
    fs.mkdirSync(`${this.backupDir}/uploads`, { recursive: true });

    let dbFile: string | null = null;
    let uploadsFile: string | null = null;
    let dbSize: string | null = null;
    let uploadsSize: string | null = null;
    let gdriveSync = false;
    let errorMsg: string | null = null;

    try {
      // 1. Dump PostgreSQL
      dbFile = `lftg_db_${date}.sql.gz`;
      await execAsync(
        `docker exec lftg-postgres-prod pg_dump -U lftg -d lftg_platform --no-owner --no-acl | gzip > ${this.backupDir}/db/${dbFile}`,
        { timeout: 120000 }
      );
      const dbStat = fs.statSync(`${this.backupDir}/db/${dbFile}`);
      dbSize = this.formatSize(dbStat.size);
      this.logger.log(`✓ DB sauvegardée: ${dbFile} (${dbSize})`);

      // 2. Archive uploads
      uploadsFile = `lftg_uploads_${date}.tar.gz`;
      await execAsync(
        `tar -czf ${this.backupDir}/uploads/${uploadsFile} -C ${this.platformDir} uploads/`,
        { timeout: 120000 }
      );
      const uplStat = fs.statSync(`${this.backupDir}/uploads/${uploadsFile}`);
      uploadsSize = this.formatSize(uplStat.size);
      this.logger.log(`✓ Uploads sauvegardés: ${uploadsFile} (${uploadsSize})`);

      // 3. Rotation locale
      await this.rotateLocalBackups(config.localRetentionDays);

      // 4. Sync Google Drive
      if (config.gdriveEnabled && config.gdriveConnected) {
        try {
          await execAsync(
            `rclone copy ${this.backupDir}/db/${dbFile} ${config.gdriveRemoteName}:${config.gdrivePath}/db/ 2>/dev/null`,
            { timeout: 300000 }
          );
          await execAsync(
            `rclone copy ${this.backupDir}/uploads/${uploadsFile} ${config.gdriveRemoteName}:${config.gdrivePath}/uploads/ 2>/dev/null`,
            { timeout: 300000 }
          );
          gdriveSync = true;
          this.logger.log('✓ Synchronisation Google Drive terminée');
        } catch (e) {
          this.logger.warn('Google Drive sync échoué:', e.message);
        }
      }

      // Mettre à jour l'historique
      await (this.prisma as any).backupHistory.update({
        where: { id: historyId },
        data: {
          status: 'success',
          dbFile,
          uploadsFile,
          dbSize,
          uploadsSize,
          gdriveSync,
          duration: Math.round((Date.now() - startTime) / 1000),
        },
      });
    } catch (e) {
      errorMsg = e.message;
      this.logger.error('Erreur backup:', e.message);
      await (this.prisma as any).backupHistory.update({
        where: { id: historyId },
        data: {
          status: 'error',
          dbFile,
          uploadsFile,
          dbSize,
          uploadsSize,
          gdriveSync,
          errorMsg,
          duration: Math.round((Date.now() - startTime) / 1000),
        },
      });
    }
  }

  private async rotateLocalBackups(retentionDays: number): Promise<void> {
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    for (const dir of ['db', 'uploads']) {
      const fullDir = `${this.backupDir}/${dir}`;
      if (!fs.existsSync(fullDir)) continue;
      for (const file of fs.readdirSync(fullDir)) {
        const filePath = path.join(fullDir, file);
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
          this.logger.log(`Supprimé: ${file}`);
        }
      }
    }
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ─── Statut d'un backup en cours ─────────────────────────────────────────────
  async getBackupStatus(id: string) {
    return (this.prisma as any).backupHistory.findUnique({ where: { id } });
  }

  // ─── Lister les fichiers locaux ───────────────────────────────────────────────
  async getLocalFiles() {
    const result: { db: string[]; uploads: string[] } = { db: [], uploads: [] };
    for (const dir of ['db', 'uploads'] as const) {
      const fullDir = `${this.backupDir}/${dir}`;
      if (fs.existsSync(fullDir)) {
        result[dir] = fs.readdirSync(fullDir).sort().reverse().slice(0, 10);
      }
    }
    return result;
  }
}
