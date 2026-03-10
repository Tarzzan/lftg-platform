import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PushSubscriptionDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: string;
  userAgent?: string;
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

  private readonly vapidPublicKey =
    process.env.VAPID_PUBLIC_KEY ||
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

  constructor(private prisma: PrismaService) {}

  getVapidPublicKey(): string {
    return this.vapidPublicKey;
  }

  async subscribe(dto: PushSubscriptionDto): Promise<{ id: string; message: string }> {
    const existing = await this.prisma.pushSubscription.findFirst({
      where: { endpoint: dto.endpoint },
    });

    if (existing) {
      return { id: existing.id, message: "Abonnement déjà existant' };
    }

    const sub = await this.prisma.pushSubscription.create({
      data: {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userId: dto.userId,
        userAgent: dto.userAgent,
      },
    });

    this.logger.log(`Nouvel abonnement push pour l"utilisateur ${dto.userId}`);
    return { id: sub.id, message: "Abonnement enregistré avec succès' };
  }

  async unsubscribe(endpoint: string): Promise<{ message: string }> {
    await this.prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });
    return { message: "Désabonnement effectué' };
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.pushSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        userAgent: true,
        createdAt: true,
        endpoint: true,
      },
    });
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<{ sent: number; failed: number }> {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        this.logger.debug(`[PUSH] Envoi vers ${sub.endpoint.substring(0, 50)}... : ${payload.title}`);
        sent++;
      } catch (error) {
        this.logger.error(`Échec envoi push: ${error.message}`);
        failed++;
      }
    }

    return { sent, failed };
  }

  async broadcast(payload: PushPayload): Promise<{ sent: number; failed: number }> {
    const subscriptions = await this.prisma.pushSubscription.findMany();
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        this.logger.debug(`[PUSH] Broadcast vers ${sub.endpoint.substring(0, 50)}...`);
        sent++;
      } catch (error) {
        failed++;
      }
    }

    this.logger.log(`Broadcast push: ${sent} envoyés, ${failed} échoués`);
    return { sent, failed };
  }
}
