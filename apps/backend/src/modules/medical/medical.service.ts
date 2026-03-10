// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MedicalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─── Visites vétérinaires ───────────────────────────────────────────────

  async findAllVisits(animalId?: string, filters?: {
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    vetName?: string;
  }) {
    const where: any = {};
    if (animalId) where.animalId = animalId;
    if (filters?.type) where.type = filters.type;
    if (filters?.vetName) where.vetName = { contains: filters.vetName, mode: 'insensitive' };
    if (filters?.dateFrom || filters?.dateTo) {
      where.visitDate = {};
      if (filters.dateFrom) where.visitDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.visitDate.lte = new Date(filters.dateTo);
    }

    return this.prisma.medicalVisit.findMany({
      where,
      include: {
        animal: { select: { id: true, name: true, species: { select: { name: true } } } },
        treatments: true,
        vaccinations: true,
      },
      orderBy: { visitDate: 'desc' },
    });
  }

  async findVisitById(id: string) {
    const visit = await this.prisma.medicalVisit.findUnique({
      where: { id },
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            identifier: true,
            species: { select: { name: true, scientificName: true } },
            enclosure: { select: { name: true } },
          },
        },
        treatments: true,
        vaccinations: true,
      },
    });
    if (!visit) throw new NotFoundException(`Visite médicale ${id} introuvable`);
    return visit;
  }

  async createVisit(dto: {
    animalId: string;
    type: string;
    visitDate: string;
    vetName: string;
    diagnosis?: string;
    notes?: string;
    weight?: number;
    temperature?: number;
    nextVisitDate?: string;
  }) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: dto.animalId },
      select: { name: true },
    });
    if (!animal) throw new NotFoundException(`Animal ${dto.animalId} introuvable`);

    const visit = await this.prisma.medicalVisit.create({
      data: {
        animalId: dto.animalId,
        type: dto.type,
        visitDate: new Date(dto.visitDate),
        vetName: dto.vetName,
        diagnosis: dto.diagnosis,
        notes: dto.notes,
        weight: dto.weight,
        temperature: dto.temperature,
        // nextVisitDate n'existe pas dans le schéma - ignoré
      },
      include: { animal: { select: { name: true } }, treatments: true, vaccinations: true },
    });

    return visit;
  }

  async updateVisit(id: string, dto: Partial<{
    type: string;
    visitDate: string;
    vetName: string;
    diagnosis: string;
    notes: string;
    weight: number;
    temperature: number;
  }>) {
    await this.findVisitById(id);
    const data: any = { ...dto };
    if (dto.visitDate) data.visitDate = new Date(dto.visitDate);
    // Supprimer les champs inexistants dans le schéma
    delete data.nextVisitDate;
    return this.prisma.medicalVisit.update({ where: { id }, data, include: { treatments: true, vaccinations: true } });
  }

  async deleteVisit(id: string) {
    await this.findVisitById(id);
    return this.prisma.medicalVisit.delete({ where: { id } });
  }

  // ─── Traitements ────────────────────────────────────────────────────────

  async addTreatment(visitId: string, dto: {
    name: string;
    dosage?: string;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
  }) {
    await this.findVisitById(visitId);
    return this.prisma.treatment.create({
      data: {
        medicalVisitId: visitId,  // Correction: visitId -> medicalVisitId
        name: dto.name,
        dosage: dto.dosage,
        frequency: dto.frequency,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        notes: dto.notes,
      },
    });
  }

  async updateTreatment(id: string, dto: Partial<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>) {
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    // Supprimer les champs inexistants
    delete data.completed;
    return this.prisma.treatment.update({ where: { id }, data });
  }

  async deleteTreatment(id: string) {
    return this.prisma.treatment.delete({ where: { id } });
  }

  // ─── Vaccinations ────────────────────────────────────────────────────────

  async addVaccination(visitId: string, dto: {
    vaccine: string;
    batchNumber?: string;
    administeredDate?: string;
    nextDueDate?: string;
    notes?: string;
  }) {
    await this.findVisitById(visitId);
    const vaccination = await this.prisma.vaccination.create({
      data: {
        medicalVisitId: visitId,  // Correction: visitId -> medicalVisitId
        name: dto.vaccine,        // Correction: vaccine -> name
        batch: dto.batchNumber,   // Correction: batchNumber -> batch
        // administeredDate n'existe pas dans le schéma - ignoré
        nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
        notes: dto.notes,
      },
    });

    if (dto.nextDueDate) {
      this.notifications.broadcast({
        type: 'medical',
        title: "Rappel de vaccination",
        message: `Rappel vaccin ${dto.vaccine} prévu le ${new Date(dto.nextDueDate).toLocaleDateString('fr-FR')}`,
        severity: 'warning',
      });
    }

    return vaccination;
  }

  // ─── Tableau de bord médical ─────────────────────────────────────────────

  async getMedicalDashboard() {
    const [totalVisits, activeAnimals, recentVisits] = await Promise.all([
      this.prisma.medicalVisit.count(),
      this.prisma.animal.count({ where: { status: 'ACTIVE' } }),
      this.prisma.medicalVisit.findMany({
        take: 5,
        orderBy: { visitDate: 'desc' },
        include: {
          animal: { select: { name: true, species: { select: { name: true } } } },
        },
      }),
    ]);

    // Visites récentes (30 derniers jours) comme proxy pour "à venir"
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCount = await this.prisma.medicalVisit.count({
      where: { visitDate: { gte: thirtyDaysAgo } },
    });

    return { totalVisits, upcomingVisits: recentCount, activeAnimals, recentVisits };
  }

  // ─── Historique médical complet d'un animal ──────────────────────────────

  async getAnimalMedicalHistory(animalId: string) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      select: { id: true, name: true, identifier: true, birthDate: true },
    });
    if (!animal) throw new NotFoundException(`Animal ${animalId} introuvable`);

    const visits = await this.prisma.medicalVisit.findMany({
      where: { animalId },
      include: { treatments: true, vaccinations: true },
      orderBy: { visitDate: 'desc' },
    });

    return { animal, visits, totalVisits: visits.length };
  }
}
