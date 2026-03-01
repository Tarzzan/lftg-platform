import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NutritionPlan {
  id: string;
  name: string;
  speciesId: string;
  speciesName: string;
  category: string;
  dailyCalories: number;
  meals: NutritionMeal[];
  supplements: NutritionSupplement[];
  restrictions: string[];
  notes: string;
  createdBy: string;
  updatedAt: Date;
}

export interface NutritionMeal {
  time: string;
  name: string;
  items: { food: string; quantity: number; unit: string; calories: number }[];
}

export interface NutritionSupplement {
  name: string;
  dose: string;
  frequency: string;
  reason: string;
}

export interface FeedingRecord {
  id: string;
  animalId: string;
  animalName: string;
  planId: string;
  date: Date;
  meal: string;
  consumed: boolean;
  consumptionRate: number;
  weight?: number;
  notes?: string;
  recordedBy: string;
}

@Injectable()
export class NutritionService {
  private readonly logger = new Logger(NutritionService.name);

  private readonly mockPlans: NutritionPlan[] = [
    {
      id: 'plan-001',
      name: 'Régime Psittacidés Adultes',
      speciesId: 'sp-001',
      speciesName: 'Ara ararauna',
      category: 'Oiseaux',
      dailyCalories: 450,
      meals: [
        {
          time: '08:00',
          name: 'Petit-déjeuner',
          items: [
            { food: 'Graines de tournesol', quantity: 30, unit: 'g', calories: 170 },
            { food: 'Fruits frais (mangue, papaye)', quantity: 80, unit: 'g', calories: 50 },
            { food: 'Légumes verts', quantity: 40, unit: 'g', calories: 15 },
          ],
        },
        {
          time: '14:00',
          name: 'Déjeuner',
          items: [
            { food: 'Granulés perroquets', quantity: 40, unit: 'g', calories: 140 },
            { food: 'Noix variées', quantity: 20, unit: 'g', calories: 130 },
          ],
        },
        {
          time: '17:30',
          name: 'Dîner',
          items: [
            { food: 'Fruits tropicaux', quantity: 60, unit: 'g', calories: 40 },
            { food: 'Légumineuses cuites', quantity: 30, unit: 'g', calories: 35 },
          ],
        },
      ],
      supplements: [
        { name: 'Vitamines A+D3', dose: '2 gouttes', frequency: 'Lundi/Jeudi', reason: 'Immunité et ossification' },
        { name: 'Calcium', dose: '1 g', frequency: 'Quotidien', reason: 'Solidité des os et plumes' },
      ],
      restrictions: ['Éviter avocat (toxique)', 'Pas de chocolat', 'Limiter les graines grasses'],
      notes: 'Varier les fruits selon la saison. Surveiller le poids hebdomadaire.',
      createdBy: 'veto@lftg.fr',
      updatedAt: new Date('2026-02-15'),
    },
    {
      id: 'plan-002',
      name: 'Régime Dendrobates',
      speciesId: 'sp-003',
      speciesName: 'Dendrobates azureus',
      category: 'Amphibiens',
      dailyCalories: 12,
      meals: [
        {
          time: '09:00',
          name: 'Repas unique',
          items: [
            { food: 'Drosophiles aptères', quantity: 15, unit: 'unités', calories: 8 },
            { food: 'Collemboles', quantity: 10, unit: 'unités', calories: 4 },
          ],
        },
      ],
      supplements: [
        { name: 'Poudre de calcium D3', dose: 'Saupoudrage', frequency: 'Tous les 2 jours', reason: 'Métabolisme osseux' },
        { name: 'Vitamines reptiles', dose: 'Saupoudrage léger', frequency: 'Hebdomadaire', reason: 'Vitalité générale' },
      ],
      restrictions: ['Insectes sauvages interdits (pesticides)', 'Taille des proies < 1/3 de la tête'],
      notes: 'Nourrir le matin. Retirer les proies non consommées après 2h.',
      createdBy: 'veto@lftg.fr',
      updatedAt: new Date('2026-01-20'),
    },
    {
      id: 'plan-003',
      name: 'Régime Boa Constricteur',
      speciesId: 'sp-004',
      speciesName: 'Boa constrictor',
      category: 'Reptiles',
      dailyCalories: 280,
      meals: [
        {
          time: '18:00',
          name: 'Repas hebdomadaire',
          items: [
            { food: 'Souris adultes (congelées/décongelées)', quantity: 2, unit: 'unités', calories: 280 },
          ],
        },
      ],
      supplements: [
        { name: 'Vitamines reptiles', dose: 'Saupoudrage', frequency: 'Mensuel', reason: 'Prévention carences' },
      ],
      restrictions: ['Jamais de proies vivantes', 'Attendre 48h avant manipulation post-repas'],
      notes: 'Fréquence : 1 fois par semaine pour adultes, 2 fois pour juvéniles. Surveiller la mue.',
      createdBy: 'veto@lftg.fr',
      updatedAt: new Date('2026-02-01'),
    },
  ];

  private readonly mockRecords: FeedingRecord[] = [
    {
      id: 'feed-001',
      animalId: 'anim-001',
      animalName: 'Ara Macao AM-001',
      planId: 'plan-001',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      meal: 'Petit-déjeuner',
      consumed: true,
      consumptionRate: 95,
      weight: 1250,
      recordedBy: 'soigneur@lftg.fr',
    },
    {
      id: 'feed-002',
      animalId: 'anim-002',
      animalName: 'Amazone AZ-007',
      planId: 'plan-001',
      date: new Date(Date.now() - 3 * 60 * 60 * 1000),
      meal: 'Petit-déjeuner',
      consumed: true,
      consumptionRate: 80,
      weight: 420,
      notes: 'Appétit légèrement réduit',
      recordedBy: 'soigneur@lftg.fr',
    },
    {
      id: 'feed-003',
      animalId: 'anim-010',
      animalName: 'Dendrobate DB-024',
      planId: 'plan-002',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000),
      meal: 'Repas unique',
      consumed: true,
      consumptionRate: 100,
      recordedBy: 'soigneur@lftg.fr',
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async getPlans() {
    return this.mockPlans;
  }

  async getPlanById(id: string) {
    return this.mockPlans.find(p => p.id === id);
  }

  async getFeedingRecords(date?: string) {
    return this.mockRecords;
  }

  async getTodaySchedule() {
    const now = new Date();
    const schedule = [];

    for (const plan of this.mockPlans) {
      for (const meal of plan.meals) {
        schedule.push({
          planId: plan.id,
          speciesName: plan.speciesName,
          mealName: meal.name,
          time: meal.time,
          items: meal.items,
          totalCalories: meal.items.reduce((sum, i) => sum + i.calories, 0),
          done: false,
        });
      }
    }

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  }

  async getNutritionStats() {
    return {
      totalPlans: this.mockPlans.length,
      speciesCovered: 3,
      feedingsToday: 8,
      feedingsDone: 5,
      avgConsumptionRate: 91.7,
      alertsNutrition: 1,
      lastUpdate: new Date(),
    };
  }
}
