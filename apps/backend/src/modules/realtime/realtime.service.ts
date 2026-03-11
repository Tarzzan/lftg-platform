import { Injectable, Logger } from '@nestjs/common';

export interface RealtimeMetric {
  key: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  delta: number;
  timestamp: Date;
  category: 'animals' | 'stock' | 'sales' | 'staff' | 'environment';
}

export interface LiveEvent {
  id: string;
  type: 'feeding' | 'medical' | 'sale' | 'alert' | 'hatching' | 'arrival' | 'departure';
  title: string;
  description: string;
  entityId: string;
  entityName: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
  actor: string;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  getMetrics(): RealtimeMetric[] {
    const now = new Date();
    return [
      { key: 'animals_total', label: 'Animaux vivants', value: 247, unit: '', trend: 'stable', delta: 0, timestamp: now, category: 'animals' },
      { key: 'animals_sick', label: 'Animaux malades', value: 3, unit: '', trend: 'up', delta: 1, timestamp: now, category: 'animals' },
      { key: 'feedings_done', label: 'Repas effectués', value: 5, unit: '/8', trend: 'up', delta: 1, timestamp: now, category: 'animals' },
      { key: 'stock_alerts', label: 'Alertes stock', value: 4, unit: '', trend: 'stable', delta: 0, timestamp: now, category: 'stock' },
      { key: 'sales_today', label: "Ventes aujourd\'hui", value: 1240, unit: '€', trend: 'up', delta: 340, timestamp: now, category: 'sales' },
      { key: 'visitors_today', label: "Visiteurs aujourd\'hui", value: 32, unit: '', trend: 'up', delta: 8, timestamp: now, category: 'staff' },
      { key: 'staff_present', label: 'Personnel présent', value: 7, unit: '/12', trend: 'stable', delta: 0, timestamp: now, category: 'staff' },
      { key: 'temperature_avg', label: 'Temp. moyenne serres', value: 28.4, unit: '°C', trend: 'stable', delta: 0.2, timestamp: now, category: 'environment' },
      { key: 'humidity_avg', label: 'Humidité moyenne', value: 78, unit: '%', trend: 'up', delta: 3, timestamp: now, category: 'environment' },
      { key: 'active_workflows', label: 'Workflows actifs', value: 4, unit: '', trend: 'stable', delta: 0, timestamp: now, category: 'animals' },
      { key: 'couvees_active', label: 'Couvées actives', value: 12, unit: '', trend: 'stable', delta: 0, timestamp: now, category: 'animals' },
      { key: 'gps_alerts', label: 'Alertes GPS', value: 1, unit: '', trend: 'up', delta: 1, timestamp: now, category: 'animals' },
    ];
  }

  getLiveEvents(): LiveEvent[] {
    const now = Date.now();
    return [
      {
        id: 'evt-001',
        type: 'feeding',
        title: 'Repas effectué',
        description: 'Petit-déjeuner des Aras — 6 animaux nourris',
        entityId: 'zone-voliere',
        entityName: 'Volière Principale',
        timestamp: new Date(now - 12 * 60 * 1000),
        severity: 'info',
        actor: 'Marie Dupont',
      },
      {
        id: 'evt-002',
        type: 'alert',
        title: 'Alerte GPS',
        description: 'Amazone AZ-022 détectée hors périmètre Nord',
        entityId: 'anim-022',
        entityName: 'Amazone AZ-022',
        timestamp: new Date(now - 45 * 60 * 1000),
        severity: 'warning',
        actor: 'Système GPS',
      },
      {
        id: 'evt-003',
        type: 'medical',
        title: 'Visite vétérinaire',
        description: 'Contrôle de routine — Ara Macao AM-042',
        entityId: 'anim-042',
        entityName: 'Ara Macao AM-042',
        timestamp: new Date(now - 90 * 60 * 1000),
        severity: 'info',
        actor: 'Dr. Rousseau',
      },
      {
        id: 'evt-004',
        type: 'sale',
        title: 'Vente enregistrée',
        description: 'Vente #VTE-2026-0127 — 840€ (Ara ararauna)',
        entityId: 'sale-127',
        entityName: 'Vente #VTE-2026-0127',
        timestamp: new Date(now - 2 * 60 * 60 * 1000),
        severity: 'info',
        actor: 'Thomas Martin',
      },
      {
        id: 'evt-005',
        type: 'hatching',
        title: 'Éclosion imminente',
        description: 'Couvée COV-2026-08 — Éclosion prévue dans 2 jours',
        entityId: 'cov-008',
        entityName: 'Couvée Amazone #COV-2026-08',
        timestamp: new Date(now - 3 * 60 * 60 * 1000),
        severity: 'info',
        actor: 'Système',
      },
      {
        id: 'evt-006',
        type: 'alert',
        title: 'Stock critique',
        description: 'Graines de tournesol : 2 kg restants (seuil : 5 kg)',
        entityId: 'art-001',
        entityName: 'Graines de tournesol',
        timestamp: new Date(now - 4 * 60 * 60 * 1000),
        severity: 'critical',
        actor: 'Système',
      },
    ];
  }

  getEnvironmentData() {
    return {
      zones: [
        { name: 'Volière Principale', temp: 27.2, humidity: 75, co2: 420, light: 8500 },
        { name: 'Serre Reptiles', temp: 32.1, humidity: 65, co2: 380, light: 12000 },
        { name: 'Serre Amphibiens', temp: 24.8, humidity: 92, co2: 410, light: 3500 },
        { name: 'Mare Centrale', temp: 26.5, humidity: 88, co2: 395, light: 15000 },
        { name: 'Quarantaine', temp: 25.0, humidity: 70, co2: 400, light: 5000 },
      ],
      weather: { temp: 29, humidity: 82, condition: 'Partiellement nuageux', wind: 12 },
      lastUpdate: new Date(),
    };
  }
}
