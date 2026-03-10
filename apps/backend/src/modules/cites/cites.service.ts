// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CitesAppendix = 'I' | 'II' | 'III' | 'NON_LISTE';

export interface CitesCheckResult {
  scientificName: string;
  commonName?: string;
  appendix: CitesAppendix;
  isProtected: boolean;
  requiresPermit: boolean;
  permitType?: string;
  restrictions: string[];
  notes?: string;
}

export interface CitesPermitDto {
  animalId?: string;
  type?: string;
  status?: string;
  issuedBy?: string;
  issuedAt?: string;
  expiresAt?: string;
  species?: string;
  quantity?: number;
  permitNumber: string;
  notes?: string;
}

@Injectable()
export class CitesService {
  private readonly logger = new Logger(CitesService.name);

  // Base de données CITES simplifiée (en production: API CITES Checklist)
  private readonly citesDatabase: Record<string, { appendix: CitesAppendix; restrictions: string[] }> = {
    'amazona amazonica': { appendix: 'II', restrictions: ['Permis CITES requis pour commerce international', 'Baguage obligatoire'] },
    'ara ararauna': { appendix: 'II', restrictions: ['Permis CITES requis', 'Certification élevage captif recommandée'] },
    'ara macao': { appendix: 'I', restrictions: ['Commerce commercial interdit', 'Permis scientifique requis', "Certificat d'élevage captif obligatoire"] },
    'caiman crocodilus': { appendix: 'II', restrictions: ["Quota d'exportation national", 'Permis CITES requis'] },
    'dendrobates azureus': { appendix: 'II', restrictions: ['Permis CITES requis', 'Élevage captif recommandé'] },
    'harpia harpyja': { appendix: 'I', restrictions: ['Commerce commercial strictement interdit', 'Protection maximale'] },
    'boa constrictor': { appendix: 'II', restrictions: ['Permis CITES requis pour export', 'Baguage recommandé'] },
    'iguana iguana': { appendix: 'II', restrictions: ['Permis CITES requis', "Quota selon pays d'origine"] },
    'chelonoidis carbonaria': { appendix: 'II', restrictions: ['Permis CITES requis', 'Élevage captif documenté'] },
    'podocnemis unifilis': { appendix: 'II', restrictions: ['Permis CITES requis', 'Espèce vulnérable UICN'] },
  };

  constructor(private prisma: PrismaService) {}

  async checkSpecies(scientificName: string): Promise<CitesCheckResult> {
    const key = scientificName.toLowerCase().trim();

    // Chercher dans la base Prisma d'abord
    const dbEntry = await this.prisma.citesEntry?.findFirst?.({
      where: { scientificName: { contains: key, mode: 'insensitive' } },
    }).catch(() => null);

    // Chercher dans la base locale
    const localEntry = this.citesDatabase[key];

    if (!localEntry && !dbEntry) {
      // Essayer de trouver via l'espèce animale
      const species = await this.prisma.species.findFirst({
        where: { scientificName: { contains: scientificName, mode: 'insensitive' } },
      }).catch(() => null);

      if (species?.citesAppendix && species.citesAppendix !== 'NON_LISTE') {
        return {
          scientificName,
          appendix: species.citesAppendix as CitesAppendix,
          isProtected: true,
          requiresPermit: ['I', 'II', 'III'].includes(species.citesAppendix),
          permitType: species.citesAppendix === 'I' ? 'CITES Annexe I — Permis import ET export' : 'CITES Annexe II — Permis export',
          restrictions: species.conservationStatus ? [`Statut UICN: ${species.conservationStatus}`] : [],
        };
      }
      return {
        scientificName,
        appendix: 'NON_LISTE',
        isProtected: false,
        requiresPermit: false,
        restrictions: [],
        notes: 'Espèce non trouvée dans la base CITES. Vérifier sur checklist.cites.org',
      };
    }

    const entry = localEntry || { appendix: dbEntry.appendix as CitesAppendix, restrictions: [] };
    const isAppendixI = entry.appendix === 'I';
    return {
      scientificName,
      appendix: entry.appendix,
      isProtected: true,
      requiresPermit: true,
      permitType: isAppendixI
        ? 'CITES Annexe I — Permis import ET export requis'
        : `CITES Annexe ${entry.appendix} — Permis export requis`,
      restrictions: entry.restrictions,
      notes: isAppendixI
        ? 'ATTENTION: Espèce Annexe I — Commerce commercial interdit. Uniquement à des fins non commerciales avec permis.'
        : 'Espèce réglementée — Permis CITES requis pour tout commerce international.',
    };
  }

  async createPermit(dto: CitesPermitDto, createdById: string) {
    return this.prisma.citesPermit.create({
      data: {
        animalId: dto.animalId,
        type: dto.type || 'IMPORT',
        status: dto.status || 'PENDING',
        issuedBy: dto.issuedBy,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        species: dto.species,
        quantity: dto.quantity || 1,
        permitNumber: dto.permitNumber,
        notes: dto.notes,
      },
    });
  }

  async getPermitsByAnimal(animalId: string) {
    return this.prisma.citesPermit.findMany({
      where: { animalId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExpiringPermits(daysAhead = 30) {
    const future = new Date();
    future.setDate(future.getDate() + daysAhead);
    return this.prisma.citesPermit.findMany({
      where: {
        expiresAt: { lte: future, gte: new Date() },
        status: 'ACTIVE',
      },
      include: {
        animal: { select: { id: true, name: true, identifier: true } },
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async getAllPermits(params: { status?: string; type?: string }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;
    return this.prisma.citesPermit.findMany({
      where,
      include: {
        animal: {
          select: {
            id: true, name: true, identifier: true,
            species: { select: { commonName: true, scientificName: true, citesAppendix: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePermitStatus(id: string, status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED' | 'PENDING') {
    return this.prisma.citesPermit.update({
      where: { id },
      data: { status },
    });
  }

  async generateComplianceReport(): Promise<{
    totalAnimals: number;
    protectedAnimals: number;
    appendixI: number;
    appendixII: number;
    activePermits: number;
    expiringIn30Days: number;
    missingPermits: number;
    alerts: string[];
  }> {
    const [animals, activePermits, expiringPermits] = await Promise.all([
      this.prisma.animal.findMany({
        where: { status: 'ACTIF' },
        include: {
          species: { select: { citesAppendix: true, commonName: true } },
          citesPermits: { where: { status: 'ACTIVE' } },
        },
      }),
      this.prisma.citesPermit.count({ where: { status: 'ACTIVE' } }),
      this.getExpiringPermits(30),
    ]);
    const protectedAnimals = animals.filter(a => a.species?.citesAppendix && a.species.citesAppendix !== 'NON_LISTE');
    const appendixI = animals.filter(a => a.species?.citesAppendix === 'I');
    const appendixII = animals.filter(a => a.species?.citesAppendix === 'II');
    const missingPermits = protectedAnimals.filter(a => a.citesPermits.length === 0);
    const alerts: string[] = [];
    if (expiringPermits.length > 0) {
      alerts.push(`${expiringPermits.length} permis CITES expirent dans les 30 prochains jours`);
    }
    if (missingPermits.length > 0) {
      alerts.push(`${missingPermits.length} animaux protégés sans permis CITES actif`);
    }
    if (appendixI.length > 0) {
      alerts.push(`${appendixI.length} animaux Annexe I — vérification de conformité recommandée`);
    }
    return {
      totalAnimals: animals.length,
      protectedAnimals: protectedAnimals.length,
      appendixI: appendixI.length,
      appendixII: appendixII.length,
      activePermits,
      expiringIn30Days: expiringPermits.length,
      missingPermits: missingPermits.length,
      alerts,
    };
  }
}
