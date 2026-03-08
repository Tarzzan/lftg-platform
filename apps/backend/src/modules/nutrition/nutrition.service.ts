// @ts-nocheck
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NutritionService {
  private readonly logger = new Logger(NutritionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.nutritionPlan.findMany({
      include: {
        species: { select: { id: true, name: true, scientificName: true } },
        meals: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.nutritionPlan.findUnique({
      where: { id },
      include: {
        species: { select: { id: true, name: true, scientificName: true } },
        meals: true,
      },
    });
    if (!plan) throw new NotFoundException(`Plan nutritionnel ${id} introuvable`);
    return plan;
  }

  async getFeedingRecords(date?: string) {
    // Les enregistrements de repas sont dans les événements agenda de type FEEDING
    const where: any = { type: 'FEEDING' };
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.startDate = { gte: d, lt: nextDay };
    }
    return this.prisma.agendaEvent.findMany({
      where,
      include: {
        animal: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startDate: 'desc' },
      take: 50,
    });
  }

  async getTodaySchedule() {
    const plans = await this.prisma.nutritionPlan.findMany({
      include: {
        species: { select: { name: true } },
        meals: true,
      },
    });

    const schedule = [];
    for (const plan of plans) {
      for (const meal of plan.meals) {
        schedule.push({
          planId: plan.id,
          planName: plan.name,
          speciesName: plan.species.name,
          mealName: meal.name,
          time: meal.time,
          items: meal.items,
          done: false,
        });
      }
    }

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  }

  async getNutritionStats() {
    const [totalPlans, speciesCount] = await Promise.all([
      this.prisma.nutritionPlan.count(),
      this.prisma.nutritionPlan.groupBy({ by: ['speciesId'] }).then(r => r.length),
    ]);

    // Événements FEEDING aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [feedingsToday, feedingsDone] = await Promise.all([
      this.prisma.agendaEvent.count({
        where: { type: 'FEEDING', startDate: { gte: today, lt: tomorrow } },
      }),
      this.prisma.agendaEvent.count({
        where: { type: 'FEEDING', startDate: { gte: today, lt: tomorrow }, status: 'COMPLETED' },
      }),
    ]);

    return {
      totalPlans,
      speciesCovered: speciesCount,
      feedingsToday,
      feedingsDone,
      avgConsumptionRate: feedingsToday > 0 ? Math.round((feedingsDone / feedingsToday) * 100) : 0,
      alertsNutrition: 0,
      lastUpdate: new Date(),
    };
  }
}
