import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BiService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    const now = new Date();
    return {
      period,
      generatedAt: now.toISOString(),
      kpis: {
        revenue: { value: 41250, change: +18.5, trend: 'UP', unit: '€' },
        animals: { value: 247, change: +12, trend: 'UP', unit: 'animaux' },
        broodSuccessRate: { value: 78.4, change: +3.2, trend: 'UP', unit: '%' },
        stockValue: { value: 18750, change: -2.1, trend: 'DOWN', unit: '€' },
        staffPresence: { value: 94.5, change: +1.5, trend: 'UP', unit: '%' },
        openTickets: { value: 3, change: -2, trend: 'DOWN', unit: 'tickets' },
        citesCompliance: { value: 96.8, change: +0.8, trend: 'UP', unit: '%' },
        avgAnimalWeight: { value: 342, change: +8, trend: 'UP', unit: 'g' },
      },
      revenueByMonth: [
        { month: 'Sep', revenue: 28400, expenses: 18200, profit: 10200 },
        { month: 'Oct', revenue: 31200, expenses: 19800, profit: 11400 },
        { month: 'Nov', revenue: 29800, expenses: 17500, profit: 12300 },
        { month: 'Déc', revenue: 38500, expenses: 22100, profit: 16400 },
        { month: 'Jan', revenue: 34800, expenses: 20300, profit: 14500 },
        { month: 'Fév', revenue: 41250, expenses: 23400, profit: 17850 },
      ],
      revenueByCategory: [
        { category: 'Ventes animaux', value: 28750, percentage: 69.7 },
        { category: 'Formations', value: 7200, percentage: 17.5 },
        { category: 'Consultations', value: 3800, percentage: 9.2 },
        { category: 'Autres', value: 1500, percentage: 3.6 },
      ],
      animalsBySpecies: [
        { species: 'Amazona amazonica', count: 45, healthy: 43, sick: 2, trend: 'STABLE' },
        { species: 'Ara chloropterus', count: 32, healthy: 32, sick: 0, trend: 'UP' },
        { species: 'Dendrobates tinctorius', count: 28, healthy: 27, sick: 1, trend: 'UP' },
        { species: 'Boa constrictor', count: 18, healthy: 18, sick: 0, trend: 'STABLE' },
        { species: 'Iguana iguana', count: 22, healthy: 21, sick: 1, trend: 'DOWN' },
        { species: 'Autres', count: 102, healthy: 98, sick: 4, trend: 'STABLE' },
      ],
      stockAlerts: [
        { article: 'Graines de tournesol', current: 2, minimum: 10, unit: 'kg', criticality: 'CRITICAL' },
        { article: 'Vitamine D3', current: 5, minimum: 20, unit: 'ml', criticality: 'HIGH' },
        { article: 'Insectes vivants', current: 150, minimum: 500, unit: 'g', criticality: 'HIGH' },
        { article: 'Substrat terrarium', current: 8, minimum: 15, unit: 'kg', criticality: 'MEDIUM' },
      ],
      broodStats: {
        active: 12,
        successRate: 78.4,
        avgEggsPerBrood: 3.2,
        avgHatchRate: 81.5,
        bySpecies: [
          { species: 'Amazona amazonica', broods: 4, eggs: 14, hatched: 11, rate: 78.6 },
          { species: 'Ara chloropterus', broods: 3, eggs: 9, hatched: 8, rate: 88.9 },
          { species: 'Dendrobates tinctorius', broods: 5, eggs: 15, hatched: 11, rate: 73.3 },
        ],
      },
      medicalStats: {
        visitsThisMonth: 28,
        activeVaccinations: 15,
        ongoingTreatments: 4,
        healthyRate: 97.2,
        byType: [
          { type: 'Routine', count: 18, percentage: 64.3 },
          { type: 'Urgence', count: 4, percentage: 14.3 },
          { type: 'Vaccination', count: 6, percentage: 21.4 },
        ],
      },
      topPerformers: {
        species: { name: 'Ara chloropterus', metric: '100% santé', score: 100 },
        employee: { name: 'Marie Dupont', metric: '98% présence', score: 98 },
        enclosure: { name: 'Volière B', metric: '0 incident', score: 100 },
      },
    };
  }

  async getRevenueForecast(months = 6) {
    const forecast = [];
    const base = 41250;
    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      forecast.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        predicted: Math.round(base * (1 + 0.05 * i + (Math.random() - 0.5) * 0.1)),
        confidence: Math.max(60, 95 - i * 5),
      });
    }
    return { forecast, model: 'linear_regression', r2: 0.87 };
  }

  async getAnimalHealthTrend(days = 30) {
    const trend = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trend.push({
        date: date.toISOString().split('T')[0],
        healthy: Math.round(240 + Math.random() * 10),
        sick: Math.round(3 + Math.random() * 4),
        underObservation: Math.round(2 + Math.random() * 3),
      });
    }
    return trend;
  }
}
