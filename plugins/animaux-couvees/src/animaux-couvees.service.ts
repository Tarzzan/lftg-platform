import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../apps/backend/src/modules/prisma/prisma.service';

@Injectable()
export class AnimauxCouveesService {
  constructor(private prisma: PrismaService) {}

  // --- Species ---
  async findAllSpecies() { return this.prisma.species.findMany({ orderBy: { name: 'asc' } }); }
  async createSpecies(data: { name: string; scientificName?: string; description?: string }) {
    return this.prisma.species.create({ data });
  }

  // --- Enclosures ---
  async findAllEnclosures() {
    return this.prisma.enclosure.findMany({
      include: { _count: { select: { animals: true } } },
      orderBy: { name: 'asc' },
    });
  }
  async createEnclosure(data: { name: string; description?: string; capacity?: number }) {
    return this.prisma.enclosure.create({ data });
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
        species: { select: { id: true, name: true } },
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
    birthDate?: Date; sex?: string; notes?: string;
  }) {
    return this.prisma.animal.create({ data, include: { species: true, enclosure: true } });
  }

  async updateAnimal(id: string, data: any) {
    await this.findAnimalById(id);
    return this.prisma.animal.update({ where: { id }, data });
  }

  async deleteAnimal(id: string) {
    await this.findAnimalById(id);
    // Supprimer d'abord les événements liés
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

  async updateBrood(id: string, data: any) {
    return this.prisma.brood.update({ where: { id }, data });
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
