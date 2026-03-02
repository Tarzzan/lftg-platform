// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PushSubscriptionDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: string;
  deviceName?: string;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, any>;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  // Clés VAPID (à générer avec web-push en production)
  private readonly vapidPublicKey = process.env.VAPID_PUBLIC_KEY ||
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
  private readonly vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ||
    'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls';

  constructor(private prisma: PrismaService) {}

  getVapidPublicKey(): string {
    return this.vapidPublicKey;
  }

  async subscribe(dto: PushSubscriptionDto): Promise<{ id: string; message: string }> {
    // Vérifier si l'abonnement existe déjà
    const existing = await this.prisma.pushSubscription.findFirst({
      where: { endpoint: dto.endpoint },
    });

    if (existing) {
      return { id: existing.id, message: 'Abonnement déjà existant' };
    }

    const sub = await this.prisma.pushSubscription.create({
      data: {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userId: dto.userId,
        deviceName: dto.deviceName || 'Appareil inconnu',
        isActive: true,
      },
    });

    this.logger.log(`Nouvel abonnement push pour l'utilisateur ${dto.userId}`);
    return { id: sub.id, message: 'Abonnement enregistré avec succès' };
  }

  async unsubscribe(endpoint: string): Promise<{ message: string }> {
    await this.prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false },
    });
    return { message: 'Désabonnement effectué' };
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<{ sent: number; failed: number }> {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await this.sendWebPush(sub, payload);
        sent++;
      } catch (error) {
        this.logger.error(`Échec envoi push à ${sub.endpoint}: ${error.message}`);
        // Désactiver les abonnements expirés (410 Gone)
        if (error.statusCode === 410) {
          await this.prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { isActive: false },
          });
        }
        failed++;
      }
    }

    return { sent, failed };
  }

  async broadcast(payload: PushPayload, roles?: string[]): Promise<{ sent: number; failed: number }> {
    const where: any = { isActive: true };

    if (roles && roles.length > 0) {
      where.user = {
        roles: {
          some: {
            role: { name: { in: roles } },
          },
        },
      };
    }

    const subscriptions = await this.prisma.pushSubscription.findMany({ where });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await this.sendWebPush(sub, payload);
        sent++;
      } catch (error) {
        failed++;
        if (error.statusCode === 410) {
          await this.prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { isActive: false },
          });
        }
      }
    }

    this.logger.log(`Broadcast push: ${sent} envoyés, ${failed} échoués`);
    return { sent, failed };
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        deviceName: true,
        createdAt: true,
        endpoint: true,
      },
    });
  }

  // ─── Envoi Web Push (simulé — en prod utiliser la lib web-push) ──────────
  private async sendWebPush(subscription: any, payload: PushPayload): Promise<void> {
    // En production : utiliser `web-push` npm package
    // const webpush = require('web-push');
    // webpush.setVapidDetails('mailto:admin@lftg.fr', this.vapidPublicKey, this.vapidPrivateKey);
    // await webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, JSON.stringify(payload));

    // Simulation pour le développement
    this.logger.debug(`[PUSH] Envoi vers ${subscription.endpoint.substring(0, 50)}... : ${payload.title}`);
  }

  // ─── Notifications prédéfinies ────────────────────────────────────────────

  async notifyStockAlert(articleName: string, quantity: number, minQuantity: number): Promise<void> {
    await this.broadcast({
      title: '⚠️ Alerte stock critique',
      body: `${articleName} : ${quantity} unités restantes (minimum: ${minQuantity})`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      url: '/admin/stock/articles',
      tag: 'stock-alert',
    }, ['ADMIN', 'GESTIONNAIRE_STOCK']);
  }

  async notifyMedicalReminder(animalName: string, visitType: string, dueDate: string): Promise<void> {
    await this.broadcast({
      title: '🩺 Rappel médical',
      body: `${animalName} : ${visitType} prévu le ${dueDate}`,
      icon: '/icons/icon-192x192.png',
      url: '/admin/medical/calendrier',
      tag: 'medical-reminder',
    }, ['ADMIN', 'VETERINAIRE', 'SOIGNEUR']);
  }

  async notifyNewSale(reference: string, buyerName: string, amount: number): Promise<void> {
    await this.broadcast({
      title: '💰 Nouvelle vente',
      body: `${reference} — ${buyerName} — ${amount.toFixed(2)} €`,
      icon: '/icons/icon-192x192.png',
      url: '/admin/ventes',
      tag: 'new-sale',
    }, ['ADMIN', 'GESTIONNAIRE']);
  }

  async notifyWorkflowUpdate(workflowTitle: string, step: string, userId: string): Promise<void> {
    await this.sendToUser(userId, {
      title: '⚙️ Workflow mis à jour',
      body: `${workflowTitle} : ${step}`,
      icon: '/icons/icon-192x192.png',
      url: '/admin/workflows',
      tag: 'workflow-update',
    });
  }
}
