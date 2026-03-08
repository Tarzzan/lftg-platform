// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenealogyService {
  constructor(private prisma: PrismaService) {}

  async getGenealogyTree(animalId: string) {
    // Récupérer l'animal avec sa généalogie
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        species: { select: { commonName: true, scientificName: true } },
        genealogy: true,
      },
    });

    if (!animal) {
      return { id: animalId, name: 'Inconnu', children: [] };
    }

    // Construire l'arbre généalogique récursivement (2 niveaux)
    const buildNode = async (id: string, depth: number): Promise<any> => {
      if (depth > 3) return null;
      const a = await this.prisma.animal.findUnique({
        where: { id },
        include: {
          species: { select: { commonName: true, scientificName: true } },
          genealogy: true,
        },
      });
      if (!a) return null;

      const node: any = {
        id: a.id,
        name: a.name || a.identifier,
        identifier: a.identifier,
        sex: a.sex,
        species: a.species?.commonName || a.species?.scientificName,
        born: a.birthDate ? a.birthDate.toISOString().split('T')[0] : null,
        inbreeding: a.genealogy?.inbreedingCoefficient || 0,
        children: [],
      };

      if (a.genealogy && depth < 3) {
        if (a.genealogy.fatherId) {
          const father = await buildNode(a.genealogy.fatherId, depth + 1);
          if (father) node.children.push({ ...father, role: 'Père' });
        }
        if (a.genealogy.motherId) {
          const mother = await buildNode(a.genealogy.motherId, depth + 1);
          if (mother) node.children.push({ ...mother, role: 'Mère' });
        }
      }

      return node;
    };

    return buildNode(animalId, 0);
  }

  async getInbreedingCoefficient(animalId: string) {
    const genealogy = await this.prisma.genealogy.findUnique({
      where: { animalId },
    });
    return {
      animalId,
      coefficient: genealogy?.inbreedingCoefficient || 0,
    };
  }

  async getAllAnimalsWithGenealogy() {
    const animals = await this.prisma.animal.findMany({
      // where: removed (deletedAt not in schema)
      include: {
        species: { select: { commonName: true, scientificName: true, citesAppendix: true } },
        genealogy: true,
      },
      orderBy: { identifier: 'asc' },
    });

    return animals.map(a => ({
      id: a.id,
      identifier: a.identifier,
      name: a.name || a.identifier,
      sex: a.sex,
      species: a.species?.commonName || a.species?.scientificName,
      scientificName: a.species?.scientificName,
      citesAppendix: a.species?.citesAppendix,
      born: a.birthDate ? a.birthDate.toISOString().split('T')[0] : null,
      status: a.status,
      hasGenealogy: !!a.genealogy,
      fatherId: a.genealogy?.fatherId || null,
      motherId: a.genealogy?.motherId || null,
      inbreeding: a.genealogy?.inbreedingCoefficient || 0,
    }));
  }
}
