// @ts-nocheck
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface CreateEnclosDto {
  name: string;
  type: string;
  capacity: number;
  surface?: number;
  location?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  features?: string[];
}

export interface UpdateEnclosDto extends Partial<CreateEnclosDto> {
  status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}

@Injectable()
export class EnclosService {
  private readonly logger = new Logger(EnclosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ─── CRUD Enclos ──────────────────────────────────────────────────────────

  async findAll(filters?: { type?: string; status?: string; search?: string }) {
    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const enclos = await this.prisma.enclosure.findMany({
      where,
      include: {
        _count: { select: { animals: true } },
      },
      orderBy: { name: 'asc' },
    });

    return enclos.map(e => ({
      ...e,
      animalCount: e._count.animals,
      occupancyRate: e.capacity > 0 ? Math.round((e._count.animals / e.capacity) * 100) : 0,
    }));
  }

  async findOne(id: string) {
    const enclos = await this.prisma.enclosure.findUnique({
      where: { id },
      include: {
        animals: {
          include: { species: true },
          orderBy: { name: 'asc' },
        },
        _count: { select: { animals: true } },
      },
    });

    if (!enclos) throw new NotFoundException(`Enclos ${id} introuvable`);

    return {
      ...enclos,
      animalCount: enclos._count.animals,
      occupancyRate: enclos.capacity > 0 ? Math.round((enclos._count.animals / enclos.capacity) * 100) : 0,
    };
  }

  async create(dto: CreateEnclosDto, userId: string) {
    const enclos = await this.prisma.enclosure.create({
      data: {
        name: dto.name,
        type: dto.type,
        capacity: dto.capacity,
        surface: dto.surface,
        location: dto.location,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        features: dto.features || [],
        status: 'ACTIVE',
      },
    });

    await this.auditService.log({
      userId,
      action: 'CREATE',
      resource: 'Enclosure',
      resourceId: enclos.id,
      details: `Enclos créé : ${enclos.name}`,
    });

    this.notificationsService.emit('enclos.created', {
      message: `Nouvel enclos créé : ${enclos.name}`,
      type: 'info',
    });

    return enclos;
  }

  async update(id: string, dto: UpdateEnclosDto, userId: string) {
    await this.findOne(id);

    const enclos = await this.prisma.enclosure.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.surface !== undefined && { surface: dto.surface }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.features && { features: dto.features }),
        ...(dto.status && { status: dto.status }),
      },
    });

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      resource: 'Enclosure',
      resourceId: id,
      details: `Enclos modifié : ${enclos.name}`,
    });

    // Alerte si mise en maintenance
    if (dto.status === 'MAINTENANCE') {
      const animals = await this.prisma.animal.count({ where: { enclosureId: id } });
      if (animals > 0) {
        this.notificationsService.emit('enclos.maintenance', {
          message: `⚠️ Enclos "${enclos.name}" en maintenance — ${animals} animal(s) à déplacer`,
          type: 'warning',
          severity: 'high',
        });
      }
    }

    return enclos;
  }

  async remove(id: string, userId: string) {
    const enclos = await this.findOne(id);

    if (enclos.animalCount > 0) {
      throw new Error(`Impossible de supprimer l'enclos "${enclos.name}" : ${enclos.animalCount} animal(s) présent(s)`);
    }

    await this.prisma.enclosure.delete({ where: { id } });

    await this.auditService.log({
      userId,
      action: 'DELETE',
      resource: 'Enclosure',
      resourceId: id,
      details: `Enclos supprimé : ${enclos.name}`,
    });

    return { success: true };
  }

  // ─── Statistiques ─────────────────────────────────────────────────────────

  async getStats() {
    const [total, active, maintenance, totalAnimals] = await Promise.all([
      this.prisma.enclosure.count(),
      this.prisma.enclosure.count({ where: { status: 'ACTIVE' } }),
      this.prisma.enclosure.count({ where: { status: 'MAINTENANCE' } }),
      this.prisma.animal.count({ where: { enclosureId: { not: null } } }),
    ]);

    const enclosWithCapacity = await this.prisma.enclosure.findMany({
      select: { capacity: true, _count: { select: { animals: true } } },
    });

    const totalCapacity = enclosWithCapacity.reduce((sum, e) => sum + e.capacity, 0);
    const globalOccupancy = totalCapacity > 0 ? Math.round((totalAnimals / totalCapacity) * 100) : 0;

    return { total, active, maintenance, totalAnimals, totalCapacity, globalOccupancy };
  }

  // ─── Carte (GeoJSON) ──────────────────────────────────────────────────────

  async getGeoJson() {
    const enclos = await this.prisma.enclosure.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        _count: { select: { animals: true } },
      },
    });

    return {
      type: 'FeatureCollection',
      features: enclos.map(e => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [e.longitude, e.latitude],
        },
        properties: {
          id: e.id,
          name: e.name,
          type: e.type,
          status: e.status,
          capacity: e.capacity,
          animalCount: e._count.animals,
          occupancyRate: e.capacity > 0 ? Math.round((e._count.animals / e.capacity) * 100) : 0,
        },
      })),
    };
  }
}
