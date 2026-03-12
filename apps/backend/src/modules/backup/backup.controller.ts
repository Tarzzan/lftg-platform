import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Backup')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  // ─── Configuration ────────────────────────────────────────────────────────
  @Get('config')
  @ApiOperation({ summary: 'Récupérer la configuration des sauvegardes' })
  async getConfig() {
    return this.backupService.getConfig();
  }

  @Patch('config')
  @ApiOperation({ summary: 'Mettre à jour la configuration des sauvegardes' })
  async updateConfig(
    @Body() data: {
      gdriveEnabled?: boolean;
      gdrivePath?: string;
      localRetentionDays?: number;
      scheduleEnabled?: boolean;
      scheduleHour?: number;
    },
  ) {
    return this.backupService.updateConfig(data);
  }

  // ─── Historique ───────────────────────────────────────────────────────────
  @Get('history')
  @ApiOperation({ summary: 'Historique des sauvegardes' })
  async getHistory(@Query('limit') limit = '20') {
    return this.backupService.getHistory(parseInt(limit, 10));
  }

  // ─── Statut d'un backup ───────────────────────────────────────────────────
  @Get('status/:id')
  @ApiOperation({ summary: 'Statut d\'un backup en cours' })
  async getStatus(@Param('id') id: string) {
    return this.backupService.getBackupStatus(id);
  }

  // ─── Fichiers locaux ──────────────────────────────────────────────────────
  @Get('files')
  @ApiOperation({ summary: 'Lister les fichiers de backup locaux' })
  async getLocalFiles() {
    return this.backupService.getLocalFiles();
  }

  // ─── Lancer un backup manuel ──────────────────────────────────────────────
  @Post('trigger')
  @ApiOperation({ summary: 'Lancer un backup manuel' })
  async triggerBackup() {
    return this.backupService.triggerBackup('manual');
  }

  // ─── Google Drive OAuth ───────────────────────────────────────────────────
  @Get('gdrive/status')
  @ApiOperation({ summary: 'Statut de la connexion Google Drive' })
  async getGdriveStatus() {
    return this.backupService.getGdriveStatus();
  }

  @Post('gdrive/connect')
  @ApiOperation({ summary: 'Initier la connexion OAuth Google Drive' })
  async initiateGdriveOAuth() {
    return this.backupService.initiateGdriveOAuth();
  }

  @Post('gdrive/finalize')
  @ApiOperation({ summary: 'Finaliser la connexion avec le code OAuth' })
  async finalizeGdriveOAuth(@Body('authCode') authCode: string) {
    return this.backupService.finalizeGdriveOAuth(authCode);
  }

  @Delete('gdrive/disconnect')
  @ApiOperation({ summary: 'Déconnecter Google Drive' })
  async disconnectGdrive() {
    await this.backupService.disconnectGdrive();
    return { success: true, message: 'Google Drive déconnecté' };
  }

  // ─── Configuration des alertes système ────────────────────────────────────

  @Get("alert-config")
  @ApiOperation({ summary: "Lire la configuration des alertes système (watchdog)" })
  async getAlertConfig() {
    const fs = require("fs");
    const path = require("path");
    const confPath = path.join(process.env.PLATFORM_DIR || "/home/ubuntu/lftg-platform", "alert.conf");
    try {
      const content = fs.readFileSync(confPath, "utf8");
      const config: Record<string, string> = {};
      content.split("\n").forEach((line: string) => {
        const match = line.match(/^([A-Z_]+)="([^"]*)"$/);
        if (match) config[match[1]] = match[2];
      });
      return {
        alertEmail: config["ALERT_EMAIL"] || "",
        telegramToken: config["ALERT_TELEGRAM_TOKEN"] ? "***configured***" : "",
        telegramChatId: config["ALERT_TELEGRAM_CHAT_ID"] || "",
        alertCooldown: parseInt(config["ALERT_COOLDOWN"] || "300"),
        telegramConfigured: !!config["ALERT_TELEGRAM_TOKEN"],
        emailConfigured: !!config["ALERT_EMAIL"],
      };
    } catch {
      return { alertEmail: "", telegramToken: "", telegramChatId: "", alertCooldown: 300, telegramConfigured: false, emailConfigured: false };
    }
  }

  @Patch("alert-config")
  @ApiOperation({ summary: "Mettre à jour la configuration des alertes système" })
  async updateAlertConfig(
    @Body() body: {
      alertEmail?: string;
      telegramToken?: string;
      telegramChatId?: string;
      alertCooldown?: number;
    },
  ) {
    const fs = require("fs");
    const path = require("path");
    const confPath = path.join(process.env.PLATFORM_DIR || "/home/ubuntu/lftg-platform", "alert.conf");
    try {
      let content = fs.readFileSync(confPath, "utf8");
      const update = (key: string, value: string) => {
        const regex = new RegExp(`^${key}="[^"]*"`, "m");
        if (regex.test(content)) {
          content = content.replace(regex, `${key}="${value}"`);
        }
      };
      if (body.alertEmail !== undefined) update("ALERT_EMAIL", body.alertEmail);
      if (body.telegramToken !== undefined && body.telegramToken !== "***configured***") update("ALERT_TELEGRAM_TOKEN", body.telegramToken);
      if (body.telegramChatId !== undefined) update("ALERT_TELEGRAM_CHAT_ID", body.telegramChatId);
      if (body.alertCooldown !== undefined) update("ALERT_COOLDOWN", String(body.alertCooldown));
      fs.writeFileSync(confPath, content, "utf8");
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  @Post("alert-test")
  @ApiOperation({ summary: "Envoyer une alerte de test" })
  async testAlert(@Body() body: { channel: "email" | "telegram" }) {
    const fs = require("fs");
    const path = require("path");
    const confPath = path.join(process.env.PLATFORM_DIR || "/home/ubuntu/lftg-platform", "alert.conf");
    const confContent = fs.existsSync(confPath) ? fs.readFileSync(confPath, "utf8") : "";
    const getConf = (key: string) => {
      const match = confContent.match(new RegExp(`^${key}="([^"]*)"`, "m"));
      return match ? match[1] : "";
    };

    if (body.channel === "telegram") {
      const token = getConf("ALERT_TELEGRAM_TOKEN");
      const chatId = getConf("ALERT_TELEGRAM_CHAT_ID");
      if (!token || !chatId) return { success: false, error: "Telegram non configuré" };
      const https = require("https");
      const msg = JSON.stringify({ chat_id: chatId, text: "✅ Test alerte LFTG — Watchdog opérationnel !" });
      return new Promise((resolve) => {
        const req = https.request(
          { hostname: "api.telegram.org", path: `/bot${token}/sendMessage`, method: "POST", headers: { "Content-Type": "application/json" } },
          (res: any) => { let d = ""; res.on("data", (c: any) => d += c); res.on("end", () => resolve({ success: res.statusCode === 200, response: d })); }
        );
        req.on("error", (e: any) => resolve({ success: false, error: e.message }));
        req.write(msg);
        req.end();
      });
    }
    return { success: false, error: "Canal non supporté" };
  }

}