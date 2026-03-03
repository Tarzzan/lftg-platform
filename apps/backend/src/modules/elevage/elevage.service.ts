import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ElevageService {
  constructor(private prisma: PrismaService) {}

  async getGenealogy(animalId: string, depth = 3) {
    // Simulated genealogy tree
    const trees: Record<string, any> = {
      'animal-1': {
        id: 'animal-1',
        name: 'Amazona (F-01)',
        species: 'Amazona amazonica',
        gender: 'FEMALE',
        birthDate: '2019-03-15',
        status: 'ALIVE',
        parents: {
          father: {
            id: 'animal-p1',
            name: 'Zeus (M-00)',
            species: 'Amazona amazonica',
            gender: 'MALE',
            birthDate: '2015-06-20',
            status: 'ALIVE',
            parents: {
              father: { id: 'animal-gp1', name: 'Atlas (M-ext)', species: 'Amazona amazonica', gender: 'MALE', birthDate: '2010-01-01', status: 'EXTERNAL', parents: null },
              mother: { id: 'animal-gp2', name: 'Hera (F-ext)', species: 'Amazona amazonica', gender: 'FEMALE', birthDate: '2011-03-15', status: 'EXTERNAL', parents: null },
            },
          },
          mother: {
            id: 'animal-p2',
            name: 'Luna (F-00)',
            species: 'Amazona amazonica',
            gender: 'FEMALE',
            birthDate: '2016-09-10',
            status: 'ALIVE',
            parents: {
              father: { id: 'animal-gp3', name: 'Orion (M-ext)', species: 'Amazona amazonica', gender: 'MALE', birthDate: '2012-05-20', status: 'EXTERNAL', parents: null },
              mother: { id: 'animal-gp4', name: 'Selene (F-ext)', species: 'Amazona amazonica', gender: 'FEMALE', birthDate: '2013-07-08', status: 'EXTERNAL', parents: null },
            },
          },
        },
        offspring: [
          { id: 'animal-o1', name: 'Petit-1 (M-02)', species: 'Amazona amazonica', gender: 'MALE', birthDate: '2022-04-10', status: 'ALIVE', broodId: 'brood-1' },
          { id: 'animal-o2', name: 'Petit-2 (F-02)', species: 'Amazona amazonica', gender: 'FEMALE', birthDate: '2022-04-10', status: 'ALIVE', broodId: 'brood-1' },
          { id: 'animal-o3', name: 'Petit-3 (M-03)', species: 'Amazona amazonica', gender: 'MALE', birthDate: '2023-05-22', status: 'ALIVE', broodId: 'brood-2' },
        ],
        consanguinityCoefficient: 0.0,
        geneticDiversity: 'HIGH',
      },
    };

    return trees[animalId] || {
      id: animalId,
      name: 'Animal inconnu',
      parents: null,
      offspring: [],
      consanguinityCoefficient: 0.0,
      geneticDiversity: 'UNKNOWN',
    };
  }

  async getBreedingPairs() {
    return [
      {
        id: 'pair-1',
        male: { id: 'animal-p1', name: 'Zeus (M-00)', species: 'Amazona amazonica' },
        female: { id: 'animal-1', name: 'Amazona (F-01)', species: 'Amazona amazonica' },
        compatibility: 'EXCELLENT',
        consanguinityRisk: 'LOW',
        lastBrood: '2023-05-22',
        totalOffspring: 3,
        status: 'ACTIVE',
        notes: 'Couple stable depuis 2019, excellente productivité',
      },
      {
        id: 'pair-2',
        male: { id: 'animal-4', name: 'Dendrobate M (D-01)', species: 'Dendrobates tinctorius' },
        female: { id: 'animal-5', name: 'Dendrobate F (D-02)', species: 'Dendrobates tinctorius' },
        compatibility: 'GOOD',
        consanguinityRisk: 'MEDIUM',
        lastBrood: '2024-01-15',
        totalOffspring: 8,
        status: 'ACTIVE',
        notes: 'Surveiller le coefficient de consanguinité',
      },
      {
        id: 'pair-3',
        male: { id: 'animal-6', name: 'Boa M (B-01)', species: 'Boa constrictor' },
        female: { id: 'animal-7', name: 'Boa F (B-02)', species: 'Boa constrictor' },
        compatibility: 'GOOD',
        consanguinityRisk: 'LOW',
        lastBrood: null,
        totalOffspring: 0,
        status: 'PLANNED',
        notes: 'Première mise en reproduction prévue pour 2026',
      },
    ];
  }

  async getGeneticStats() {
    return {
      totalAnimals: 247,
      withGenealogy: 89,
      breedingPairs: 12,
      activeBreedings: 5,
      avgConsanguinity: 0.032,
      highRiskPairs: 2,
      speciesStats: [
        { species: 'Amazona amazonica', count: 45, avgConsanguinity: 0.028, diversity: 'HIGH' },
        { species: 'Ara chloropterus', count: 32, avgConsanguinity: 0.041, diversity: 'MEDIUM' },
        { species: 'Dendrobates tinctorius', count: 28, avgConsanguinity: 0.067, diversity: 'MEDIUM' },
        { species: 'Boa constrictor', count: 18, avgConsanguinity: 0.012, diversity: 'HIGH' },
        { species: 'Iguana iguana', count: 22, avgConsanguinity: 0.019, diversity: 'HIGH' },
      ],
    };
  }

  async suggestPairings(animalId: string) {
    return {
      animalId,
      suggestions: [
        {
          partnerId: 'animal-ext-1',
          partnerName: 'Amazona (F-ext-01)',
          source: 'Éleveur partenaire — Cayenne',
          consanguinityCoefficient: 0.0,
          compatibilityScore: 98,
          geneticDiversityGain: 'HIGH',
          recommendation: 'STRONGLY_RECOMMENDED',
        },
        {
          partnerId: 'animal-p3',
          partnerName: 'Luna-2 (F-00b)',
          source: 'LFTG interne',
          consanguinityCoefficient: 0.125,
          compatibilityScore: 72,
          geneticDiversityGain: 'MEDIUM',
          recommendation: 'ACCEPTABLE',
        },
      ],
    };
  }
}
