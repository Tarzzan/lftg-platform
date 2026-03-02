// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      animalCount,
      speciesCount,
      activeBroods,
      stockItems,
      lowStockCount,
      workflowInstances,
      employeeCount,
      courseCount,
    ] = await Promise.all([
      this.prisma.animal.count({ where: { status: 'alive' } }),
      this.prisma.species.count(),
      this.prisma.brood.count({ where: { status: 'incubating' } }),
      this.prisma.stockItem.findMany({ select: { quantity: true, lowStockThreshold: true } }),
      this.prisma.stockItem.count({ where: { quantity: { lte: this.prisma.stockItem.fields.lowStockThreshold } } }).catch(() => 0),
      this.prisma.workflowInstance.count(),
      this.prisma.employee.count({ where: { status: 'active' } }),
      this.prisma.course.count({ where: { isPublished: true } }),
    ]);

    const lowStock = stockItems.filter((i) => i.quantity <= i.lowStockThreshold).length;

    return {
      animals: { alive: animalCount, species: speciesCount, activeBroods },
      stock: { total: stockItems.length, lowStock },
      workflows: { total: workflowInstances },
      hr: { employees: employeeCount },
      formation: { courses: courseCount },
    };
  }

  async getAnimalsBySpecies() {
    const data = await this.prisma.animal.groupBy({
      by: ['speciesId'],
      _count: { id: true },
      where: { status: 'alive' },
    });

    const species = await this.prisma.species.findMany({
      where: { id: { in: data.map((d) => d.speciesId) } },
      select: { id: true, name: true, commonName: true },
    });

    return data.map((d) => {
      const sp = species.find((s) => s.id === d.speciesId);
      return {
        speciesId: d.speciesId,
        name: sp?.commonName || sp?.name || 'Inconnu',
        count: d._count.id,
      };
    }).sort((a, b) => b.count - a.count);
  }

  async getStockEvolution(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const movements = await this.prisma.stockMovement.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, type: true, quantity: true },
    });

    // Group by day
    const byDay = new Map<string, { in: number; out: number }>();
    for (const m of movements) {
      const day = m.createdAt.toISOString().slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, { in: 0, out: 0 });
      const entry = byDay.get(day)!;
      if (m.type === 'in') entry.in += m.quantity;
      else entry.out += m.quantity;
    }

    return Array.from(byDay.entries()).map(([date, values]) => ({
      date,
      entrees: values.in,
      sorties: values.out,
    }));
  }

  async getWorkflowsByState() {
    const data = await this.prisma.workflowInstance.groupBy({
      by: ['currentState'],
      _count: { id: true },
    });

    const stateLabels: Record<string, string> = {
      draft: 'Brouillon',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      cancelled: 'Annulé',
      in_progress: 'En cours',
      completed: 'Terminé',
    };

    return data.map((d) => ({
      state: d.currentState,
      label: stateLabels[d.currentState] ?? d.currentState,
      count: d._count.id,
    }));
  }

  async getFormationProgress() {
    const enrollments = await this.prisma.enrollment.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return enrollments.map((e) => ({
      status: e.status,
      count: e._count.id,
    }));
  }
}
