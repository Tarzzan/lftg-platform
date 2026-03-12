import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../apps/backend/src/modules/prisma/prisma.service';

@Injectable()
export class AnimauxCouveesService {
  constructor(private prisma: PrismaService) {}

  // --- Species ---
  async findAllSpecies() {
    return this.prisma.species.findMany({
      include: { _count: { select: { animals: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createSpecies(data: {
    name: string;
    scientificName?: string;
    category?: string;
    description?: string;
    conservationStatus?: string;
    citesAppendix?: string;
    citesStatus?: string;
    habitat?: string;
    diet?: string;
    lifespan?: number;
    gestationDays?: number;
    incubationDays?: number;
    imageUrl?: string;
    origin?: string;
  }) {
    return this.prisma.species.create({ data });
  }

  async updateSpecies(id: string, data: {
    name?: string;
    scientificName?: string;
    category?: string;
    description?: string;
    conservationStatus?: string;
    citesAppendix?: string;
    citesStatus?: string;
    habitat?: string;
    diet?: string;
    lifespan?: number;
    gestationDays?: number;
    incubationDays?: number;
    imageUrl?: string;
    origin?: string;
  }) {
    const existing = await this.prisma.species.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Espèce ${id} introuvable`);
    return this.prisma.species.update({ where: { id }, data });
  }

  async deleteSpecies(id: string) {
    const existing = await this.prisma.species.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Espèce ${id} introuvable`);
    await this.prisma.species.delete({ where: { id } });
    return { deleted: true };
  }

  // --- Enclosures ---
  async findAllEnclosures() {
    return this.prisma.enclosure.findMany({
      include: { _count: { select: { animals: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createEnclosure(data: { name: string; description?: string; capacity?: number; type?: string; code?: string }) {
    return this.prisma.enclosure.create({ data });
  }

  async updateEnclosure(id: string, data: any) {
    return this.prisma.enclosure.update({ where: { id }, data });
  }

  async deleteEnclosure(id: string) {
    await this.prisma.enclosure.delete({ where: { id } });
    return { deleted: true };
  }

  // --- Animals ---
  async findAllAnimals(filters?: { speciesId?: string; enclosureId?: string; isAlive?: boolean }) {
    return this.prisma.animal.findMany({
      where: {
        ...(filters?.speciesId && { speciesId: filters.speciesId }),
        ...(filters?.enclosureId && { enclosureId: filters.enclosureId }),
        ...(filters?.isAlive !== undefined && { status: filters.isAlive ? 'ACTIF' : undefined }),
      },
      include: {
        species: { select: { id: true, name: true, imageUrl: true } },
        enclosure: { select: { id: true, name: true } },
      },
      orderBy: { identifier: 'asc' },
    });
  }

  async findAnimalById(id: string) {
    const animal = await this.prisma.animal.findUnique({
      where: { id },
      include: {
        species: true,
        enclosure: true,
        events: { orderBy: { timestamp: 'desc' }, take: 50 },
      },
    });
    if (!animal) throw new NotFoundException(`Animal ${id} introuvable`);
    return animal;
  }

  async createAnimal(data: {
    identifier: string; speciesId: string; enclosureId?: string;
    birthDate?: Date; sex?: string; notes?: string; status?: string;
    weight?: number; name?: string;
  }) {
    return this.prisma.animal.create({ data, include: { species: true, enclosure: true } });
  }

  async updateAnimal(id: string, data: any) {
    await this.findAnimalById(id);
    return this.prisma.animal.update({ where: { id }, data });
  }

  async deleteAnimal(id: string) {
    await this.findAnimalById(id);
    await this.prisma.animalEvent.deleteMany({ where: { animalId: id } });
    await this.prisma.animal.delete({ where: { id } });
    return { deleted: true };
  }

  // --- Events ---
  async addEvent(data: { animalId: string; type: string; notes?: string; userId: string }) {
    return this.prisma.animalEvent.create({ data });
  }

  async findEventsByAnimal(animalId: string) {
    return this.prisma.animalEvent.findMany({
      where: { animalId },
      orderBy: { timestamp: 'desc' },
    });
  }

  // --- Broods ---
  async findAllBroods() {
    return this.prisma.brood.findMany({
      include: { species: { select: { id: true, name: true } } },
      orderBy: { incubationStartDate: 'desc' },
    });
  }

  async createBrood(data: {
    speciesId: string; incubationStartDate: Date; expectedHatchDate?: Date;
    eggCount: number; notes?: string;
  }) {
    return this.prisma.brood.create({ data, include: { species: true } });
  }

  async findBroodById(id: string) {
    return this.prisma.brood.findUnique({ where: { id }, include: { species: true } });
  }

  async updateBrood(id: string, data: any) {
    return this.prisma.brood.update({ where: { id }, data });
  }

  async deleteBrood(id: string) {
    await this.prisma.brood.delete({ where: { id } });
    return { deleted: true };
  }

  // --- Dashboard widgets ---
  async getStats() {
    const [totalAnimals, aliveAnimals, activeBroods, speciesCount] = await Promise.all([
      this.prisma.animal.count(),
      this.prisma.animal.count({ where: { status: 'ACTIF' } }),
      this.prisma.brood.count({ where: { status: 'incubating' } }),
      this.prisma.species.count(),
    ]);
    return { totalAnimals, aliveAnimals, activeBroods, speciesCount };
  }
}
