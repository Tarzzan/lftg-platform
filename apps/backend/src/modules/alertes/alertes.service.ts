// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface AlertRule {
  id: string;
  name: string;
  type: 'stock_low' | 'animal_health' | 'weather' | 'cites_expiry' | 'temperature' | 'custom';
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  channels: ('email' | 'sms' | 'push' | 'sse')[];
}

export interface Alert {
  id: string;
  ruleId: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  entityName: string;
  value: number;
  threshold: number;
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

@Injectable()
export class AlertesService {
  private readonly logger = new Logger(AlertesService.name);

  // Règles d'alerte prédéfinies
  private readonly defaultRules: AlertRule[] = [
    {
      id: 'rule-stock-critical',
      name: 'Stock critique',
      type: 'stock_low',
      condition: 'quantity < minStock * 0.5',
      threshold: 0.5,
      severity: 'critical',
      enabled: true,
      channels: ['sse', 'email', 'push'],
    },
    {
      id: 'rule-stock-low',
      name: 'Stock faible',
      type: 'stock_low',
      condition: 'quantity < minStock',
      threshold: 1.0,
      severity: 'warning',
      enabled: true,
      channels: ['sse', 'push'],
    },
    {
      id: 'rule-animal-sick',
      name: 'Animal malade',
      type: 'animal_health',
      condition: 'healthStatus = SICK',
      threshold: 0,
      severity: 'critical',
      enabled: true,
      channels: ['sse', 'email', 'sms', 'push'],
    },
    {
      id: 'rule-cites-expiry',
      name: 'Permis CITES expirant',
      type: 'cites_expiry',
      condition: 'expiryDate < now + 30days',
      threshold: 30,
      severity: 'warning',
      enabled: true,
      channels: ['sse', 'email'],
    },
    {
      id: 'rule-temperature-high',
      name: 'Température élevée',
      type: 'temperature',
      condition: 'temperature > maxTemp',
      threshold: 35,
      severity: 'warning',
      enabled: true,
      channels: ['sse', 'push'],
    },
    {
      id: 'rule-couvee-hatching',
      name: 'Éclosion imminente',
      type: 'custom',
      condition: 'expectedHatchDate < now + 3days',
      threshold: 3,
      severity: 'info',
      enabled: true,
      channels: ['sse', 'push'],
    },
  ];

  // Alertes mockées pour la démo
  private readonly mockAlerts: Alert[] = [
    {
      id: 'alert-001',
      ruleId: 'rule-stock-critical',
      type: 'stock_low',
      severity: 'critical',
      title: "Stock critique — Graines de tournesol",
      message: "Le stock de graines de tournesol est à 2 kg, en dessous du seuil critique de 5 kg.",
      entityType: 'article',
      entityId: 'art-001',
      entityName: 'Graines de tournesol',
      value: 2,
      threshold: 5,
      triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      acknowledged: false,
    },
    {
      id: 'alert-002',
      ruleId: 'rule-animal-sick',
      type: 'animal_health',
      severity: 'critical',
      title: "Animal malade — Ara Macao #AM-042",
      message: "L'Ara Macao AM-042 présente des symptômes respiratoires. Consultation vétérinaire urgente requise.",
      entityType: 'animal',
      entityId: 'anim-042',
      entityName: 'Ara Macao AM-042',
      value: 0,
      threshold: 0,
      triggeredAt: new Date(Date.now() - 45 * 60 * 1000),
      acknowledged: false,
    },
    {
      id: 'alert-003',
      ruleId: 'rule-cites-expiry',
      type: 'cites_expiry',
      severity: 'warning',
      title: "Permis CITES expirant — Dendrobates azureus",
      message: "Le permis CITES pour les Dendrobates azureus expire dans 18 jours (19 Mars 2026).",
      entityType: 'cites_permit',
      entityId: 'cites-007',
      entityName: 'Permis Dendrobates azureus',
      value: 18,
      threshold: 30,
      triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      acknowledged: true,
      acknowledgedBy: 'admin@lftg.fr',
    },
    {
      id: 'alert-004',
      ruleId: 'rule-temperature-high',
      type: 'temperature',
      severity: 'warning',
      title: "Température élevée — Serre Reptiles",
      message: "La température dans la serre Reptiles a atteint 38°C, dépassant le seuil de 35°C.",
      entityType: 'enclos',
      entityId: 'enc-003',
      entityName: 'Serre Reptiles',
      value: 38,
      threshold: 35,
      triggeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      acknowledged: true,
      acknowledgedBy: 'soigneur@lftg.fr',
    },
    {
      id: 'alert-005',
      ruleId: 'rule-couvee-hatching',
      type: 'custom',
      severity: 'info',
      title: "Éclosion imminente — Couvée #COV-2026-08",
      message: "La couvée COV-2026-08 (Amazone à front bleu) devrait éclore dans 2 jours.",
      entityType: 'couvee',
      entityId: 'cov-008',
      entityName: 'Couvée Amazone #COV-2026-08',
      value: 2,
      threshold: 3,
      triggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      acknowledged: false,
    },
    {
      id: 'alert-006',
      ruleId: 'rule-stock-low',
      type: 'stock_low',
      severity: 'warning',
      title: "Stock faible — Vitamines A+D3",
      message: "Le stock de Vitamines A+D3 est à 3 flacons, en dessous du seuil de 5.",
      entityType: 'article',
      entityId: 'art-012',
      entityName: 'Vitamines A+D3',
      value: 3,
      threshold: 5,
      triggeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      acknowledged: false,
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async getAlerts(filters?: {
    severity?: string;
    type?: string;
    acknowledged?: boolean;
    resolved?: boolean;
  }): Promise<Alert[]> {
    let alerts = [...this.mockAlerts];

    if (filters?.severity) {
      alerts = alerts.filter(a => a.severity === filters.severity);
    }
    if (filters?.type) {
      alerts = alerts.filter(a => a.type === filters.type);
    }
    if (filters?.acknowledged !== undefined) {
      alerts = alerts.filter(a => a.acknowledged === filters.acknowledged);
    }
    if (filters?.resolved !== undefined) {
      if (filters.resolved) {
        alerts = alerts.filter(a => a.resolvedAt !== undefined);
      } else {
        alerts = alerts.filter(a => a.resolvedAt === undefined);
      }
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  async getAlertStats() {
    const alerts = await this.getAlerts();
    const active = alerts.filter(a => !a.resolvedAt);
    return {
      total: alerts.length,
      active: active.length,
      critical: active.filter(a => a.severity === 'critical').length,
      warning: active.filter(a => a.severity === 'warning').length,
      info: active.filter(a => a.severity === 'info').length,
      unacknowledged: active.filter(a => !a.acknowledged).length,
      resolved: alerts.filter(a => a.resolvedAt).length,
    };
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<Alert> {
    const alert = this.mockAlerts.find(a => a.id === alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found`);
    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    this.logger.log(`Alert ${alertId} acknowledged by ${userId}`);
    return alert;
  }

  async resolveAlert(alertId: string): Promise<Alert> {
    const alert = this.mockAlerts.find(a => a.id === alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found`);
    alert.resolvedAt = new Date();
    this.logger.log(`Alert ${alertId} resolved`);
    return alert;
  }

  getRules(): AlertRule[] {
    return this.defaultRules;
  }

  async runAlertCheck(): Promise<{ checked: number; triggered: number }> {
    this.logger.log('Running alert check cycle...');
    // En production : vérifier stock, santé animaux, températures, CITES, etc.
    return { checked: this.defaultRules.filter(r => r.enabled).length, triggered: 0 };
  }
}
