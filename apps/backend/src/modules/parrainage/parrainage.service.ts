import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Sponsorship {
  id: string;
  animalId: string;
  animalName: string;
  species: string;
  sponsorName: string;
  sponsorEmail: string;
  sponsorPhone?: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  startDate: Date;
  nextPayment: Date;
  status: 'active' | 'paused' | 'cancelled' | 'pending';
  totalPaid: number;
  certificate?: string;
  updates: SponsorshipUpdate[];
  stripeSubscriptionId?: string;
}

export interface SponsorshipUpdate {
  id: string;
  date: Date;
  title: string;
  content: string;
  photos?: string[];
  author: string;
}

@Injectable()
export class ParrainageService {
  private readonly logger = new Logger(ParrainageService.name);

  private readonly mockSponsorships: Sponsorship[] = [
    {
      id: 'spon-001',
      animalId: 'anim-001',
      animalName: 'Ara Macao AM-001',
      species: 'Ara macao',
      sponsorName: 'Jean-Pierre Dumont',
      sponsorEmail: 'jp.dumont@email.fr',
      sponsorPhone: '+33 6 12 34 56 78',
      amount: 25,
      frequency: 'monthly',
      startDate: new Date('2025-06-01'),
      nextPayment: new Date('2026-03-01'),
      status: 'active',
      totalPaid: 225,
      certificate: 'CERT-SPON-001-2025',
      updates: [
        {
          id: 'upd-001',
          date: new Date('2026-02-15'),
          title: "Nouvelles de votre filleul !",
          content: "AM-001 se porte à merveille. Il a appris 3 nouveaux mots ce mois-ci et participe activement aux sessions d\'enrichissement comportemental.',
          author: 'soigneur@lftg.fr',
        },
      ],
    },
    {
      id: 'spon-002',
      animalId: 'anim-010',
      animalName: 'Dendrobate DB-024',
      species: 'Dendrobates azureus',
      sponsorName: 'Marie Leclerc',
      sponsorEmail: 'marie.leclerc@gmail.com',
      amount: 15,
      frequency: 'monthly',
      startDate: new Date('2025-09-01'),
      nextPayment: new Date('2026-03-01'),
      status: 'active',
      totalPaid: 90,
      certificate: 'CERT-SPON-002-2025',
      updates: [],
    },
    {
      id: 'spon-003',
      animalId: 'anim-012',
      animalName: 'Caïman CL-012',
      species: 'Caiman crocodilus',
      sponsorName: 'Société BioGuyane SARL',
      sponsorEmail: 'contact@bioguyane.fr',
      amount: 100,
      frequency: 'monthly',
      startDate: new Date('2025-01-01'),
      nextPayment: new Date('2026-03-01'),
      status: 'active',
      totalPaid: 1400,
      certificate: 'CERT-SPON-003-2025',
      updates: [],
    },
    {
      id: 'spon-004',
      animalId: 'anim-005',
      animalName: 'Ara Ararauna AA-005',
      species: 'Ara ararauna',
      sponsorName: 'École Primaire Jules Verne',
      sponsorEmail: 'direction@ep-julesverne.fr',
      amount: 50,
      frequency: 'quarterly',
      startDate: new Date('2025-09-01'),
      nextPayment: new Date('2026-06-01'),
      status: 'active',
      totalPaid: 100,
      certificate: 'CERT-SPON-004-2025',
      updates: [],
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async getSponsorships() {
    return this.mockSponsorships;
  }

  async getSponsorshipById(id: string) {
    return this.mockSponsorships.find(s => s.id === id);
  }

  async getAvailableAnimals() {
    return [
      { id: 'anim-003', name: 'Ara Chloroptère AC-003', species: 'Ara chloropterus', photo: '🦜', monthlyMin: 20, description: "Magnifique ara rouge de 4 ans, très sociable." },
      { id: "anim-007", name: 'Amazone AZ-007', species: 'Amazona amazonica', photo: '🦜', monthlyMin: 15, description: "Amazone à front bleu de 2 ans, en pleine croissance." },
      { id: "anim-015", name: 'Boa BC-015', species: 'Boa constrictor', photo: '🐍', monthlyMin: 10, description: "Boa constricteur de 3 ans, calme et en bonne santé." },
    ];
  }

  async getStats() {
    const active = this.mockSponsorships.filter(s => s.status === "active");
    return {
      total: this.mockSponsorships.length,
      active: active.length,
      monthlyRevenue: active.reduce((sum, s) => {
        if (s.frequency === 'monthly') return sum + s.amount;
        if (s.frequency === 'quarterly') return sum + s.amount / 3;
        return sum + s.amount / 12;
      }, 0),
      totalRaised: this.mockSponsorships.reduce((sum, s) => sum + s.totalPaid, 0),
      animalsSponsored: new Set(active.map(s => s.animalId)).size,
      pendingUpdates: 2,
    };
  }
}
