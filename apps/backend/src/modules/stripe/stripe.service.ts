import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface CreatePaymentIntentDto {
  amount: number; // en centimes
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
  customerId?: string;
  saleId?: string;
}

export interface CreateCheckoutSessionDto {
  items: Array<{
    name: string;
    description?: string;
    amount: number;
    quantity: number;
    images?: string[];
  }>;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface StripeWebhookEvent {
  type: string;
  data: { object: Record<string, unknown> };
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  // Configuration Stripe (clés depuis .env)
  private readonly stripePublicKey = process.env.STRIPE_PUBLIC_KEY || 'pk_test_placeholder';
  private readonly stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
  private readonly webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Créer une intention de paiement Stripe
   */
  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    this.logger.log(`Création PaymentIntent: ${dto.amount / 100}€ — ${dto.description}`);

    // Simulation d'un PaymentIntent Stripe (en production : appel API Stripe réel)
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      object: 'payment_intent',
      amount: dto.amount,
      currency: dto.currency || 'eur',
      status: 'requires_payment_method',
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 16)}`,
      description: dto.description,
      metadata: dto.metadata || {},
      created: Math.floor(Date.now() / 1000),
      livemode: false,
    };

    // Enregistrer en base
    await this.prisma.auditLog.create({
      data: {
        action: 'STRIPE_PAYMENT_INTENT_CREATED',
        entityType: 'PaymentIntent',
        entityId: paymentIntent.id,
        newValues: JSON.stringify(paymentIntent),
        userId: null,
      },
    });

    return paymentIntent;
  }

  /**
   * Créer une session Checkout Stripe
   */
  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    this.logger.log(`Création CheckoutSession: ${dto.items.length} articles`);

    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount * item.quantity, 0);

    const session = {
      id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      object: 'checkout.session',
      url: `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substr(2, 20)}`,
      payment_status: 'unpaid',
      status: 'open',
      amount_total: totalAmount,
      currency: 'eur',
      customer_email: dto.customerEmail,
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      metadata: dto.metadata || {},
      line_items: dto.items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name, description: item.description },
          unit_amount: item.amount,
        },
        quantity: item.quantity,
      })),
      created: Math.floor(Date.now() / 1000),
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };

    return session;
  }

  /**
   * Récupérer les statistiques de paiement
   */
  async getPaymentStats(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day': startDate.setDate(now.getDate() - 1); break;
      case 'week': startDate.setDate(now.getDate() - 7); break;
      case 'month': startDate.setMonth(now.getMonth() - 1); break;
      case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
    }

    // Données simulées pour la démo
    return {
      period,
      totalRevenue: 41250,
      totalTransactions: 87,
      successRate: 97.2,
      averageAmount: 474,
      refundedAmount: 320,
      disputedAmount: 0,
      topPaymentMethods: [
        { method: 'card', count: 72, amount: 35100 },
        { method: 'sepa_debit', count: 12, amount: 5400 },
        { method: 'paypal', count: 3, amount: 750 },
      ],
      dailyRevenue: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now.getTime() - (29 - i) * 86400000).toISOString().split('T')[0],
        amount: Math.floor(800 + Math.random() * 1200),
        transactions: Math.floor(2 + Math.random() * 5),
      })),
    };
  }

  /**
   * Gérer les webhooks Stripe
   */
  async handleWebhook(event: StripeWebhookEvent) {
    this.logger.log(`Webhook Stripe reçu: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'charge.refunded':
        await this.handleRefund(event.data.object);
        break;
      default:
        this.logger.warn(`Événement Stripe non géré: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(paymentIntent: Record<string, unknown>) {
    this.logger.log(`Paiement réussi: ${paymentIntent['id']}`);
    this.notifications.broadcast('payment_success', {
      paymentIntentId: paymentIntent['id'],
      amount: paymentIntent['amount'],
      currency: paymentIntent['currency'],
    });
  }

  private async handlePaymentFailed(paymentIntent: Record<string, unknown>) {
    this.logger.warn(`Paiement échoué: ${paymentIntent['id']}`);
    this.notifications.broadcast('payment_failed', {
      paymentIntentId: paymentIntent['id'],
      error: paymentIntent['last_payment_error'],
    });
  }

  private async handleCheckoutCompleted(session: Record<string, unknown>) {
    this.logger.log(`Checkout complété: ${session['id']}`);
    // Créer la vente en base de données
    await this.prisma.auditLog.create({
      data: {
        action: 'STRIPE_CHECKOUT_COMPLETED',
        entityType: 'CheckoutSession',
        entityId: session['id'] as string,
        newValues: JSON.stringify(session),
        userId: null,
      },
    });
  }

  private async handleRefund(charge: Record<string, unknown>) {
    this.logger.log(`Remboursement: ${charge['id']}`);
    this.notifications.broadcast('payment_refunded', { chargeId: charge['id'] });
  }

  /**
   * Créer un lien de paiement pour une vente
   */
  async createPaymentLink(saleId: string, amount: number, description: string) {
    return {
      id: `plink_${Date.now()}`,
      url: `https://buy.stripe.com/test_${Math.random().toString(36).substr(2, 20)}`,
      active: true,
      amount,
      currency: 'eur',
      description,
      saleId,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    };
  }

  /**
   * Lister les transactions récentes
   */
  async listTransactions(limit = 20, offset = 0) {
    const transactions = Array.from({ length: limit }, (_, i) => ({
      id: `pi_${Date.now() - i * 100000}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.floor(1500 + Math.random() * 5000),
      currency: 'eur',
      status: Math.random() > 0.05 ? 'succeeded' : 'failed',
      description: ['Vente Ara ararauna', 'Visite guidée', 'Consultation vétérinaire', 'Formation soigneurs'][Math.floor(Math.random() * 4)],
      customerEmail: `client${i + 1}@example.com`,
      created: new Date(Date.now() - i * 3600000).toISOString(),
      paymentMethod: ['card', 'sepa_debit', 'paypal'][Math.floor(Math.random() * 3)],
    }));

    return {
      data: transactions,
      total: 87,
      hasMore: offset + limit < 87,
    };
  }
}
