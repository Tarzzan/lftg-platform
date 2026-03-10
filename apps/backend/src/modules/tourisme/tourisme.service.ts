import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TourismeService {
  constructor(private prisma: PrismaService) {}

  async getVisites(filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
    // Mock data — à remplacer par Prisma queries
    return [
      {
        id: 'visit-1',
        title: "Visite guidée Perroquets & Perruches',
        date: "2026-03-05T10:00:00Z',
        duration: 90,
        guide: 'Marie Dupont',
        maxParticipants: 15,
        currentParticipants: 12,
        price: 18,
        status: 'CONFIRMED',
        type: 'GUIDED',
        zones: ['Volière A', 'Volière B'],
        language: 'fr',
      },
      {
        id: 'visit-2',
        title: "Découverte Reptiles de Guyane',
        date: "2026-03-05T14:00:00Z',
        duration: 60,
        guide: 'Jean Martin',
        maxParticipants: 10,
        currentParticipants: 8,
        price: 15,
        status: 'CONFIRMED',
        type: 'GUIDED',
        zones: ['Reptilarium'],
        language: 'fr',
      },
      {
        id: 'visit-3',
        title: "Groupe scolaire — CE2 École Jules Ferry',
        date: "2026-03-07T09:00:00Z',
        duration: 120,
        guide: 'Sophie Bernard',
        maxParticipants: 30,
        currentParticipants: 28,
        price: 8,
        status: 'CONFIRMED',
        type: 'SCHOOL',
        zones: ['Volière A', 'Reptilarium', 'Amphibiens'],
        language: 'fr',
      },
      {
        id: 'visit-4',
        title: "Visite privée famille — Réservation Dupont',
        date: "2026-03-08T11:00:00Z',
        duration: 120,
        guide: 'Marie Dupont',
        maxParticipants: 6,
        currentParticipants: 4,
        price: 45,
        status: 'PENDING',
        type: 'PRIVATE',
        zones: ['Volière A', 'Volière B', 'Reptilarium'],
        language: 'fr',
      },
    ];
  }

  async getReservations(filters?: { status?: string }) {
    return [
      {
        id: 'res-1',
        visitId: 'visit-1',
        visitTitle: 'Visite guidée Perroquets & Perruches',
        visitDate: '2026-03-05T10:00:00Z',
        clientName: 'Martin Famille',
        clientEmail: 'martin.famille@email.fr',
        clientPhone: '0694123456',
        participants: 4,
        totalPrice: 72,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        createdAt: '2026-02-20T14:30:00Z',
        notes: 'Enfants de 6 et 8 ans',
      },
      {
        id: 'res-2',
        visitId: 'visit-2',
        visitTitle: 'Découverte Reptiles de Guyane',
        visitDate: '2026-03-05T14:00:00Z',
        clientName: 'Dubois Pierre',
        clientEmail: 'p.dubois@email.fr',
        clientPhone: '0694987654',
        participants: 2,
        totalPrice: 30,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        createdAt: '2026-02-22T09:15:00Z',
        notes: '',
      },
      {
        id: 'res-3',
        visitId: 'visit-4',
        visitTitle: 'Visite privée famille',
        visitDate: '2026-03-08T11:00:00Z',
        clientName: 'Dupont Jean-Paul',
        clientEmail: 'jp.dupont@email.fr',
        clientPhone: '0694555777',
        participants: 4,
        totalPrice: 180,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: '2026-02-28T16:45:00Z',
        notes: 'Anniversaire enfant — prévoir surprise',
      },
    ];
  }

  async getStats() {
    return {
      visitesToday: 3,
      participantsToday: 48,
      revenueThisMonth: 2840,
      reservationsPending: 5,
      averageRating: 4.7,
      totalVisitsThisMonth: 24,
      occupancyRate: 82,
    };
  }

  async createVisite(data: any) {
    return { id: `visit-${Date.now()}`, ...data, status: 'PENDING', currentParticipants: 0 };
  }

  async createReservation(data: any) {
    return {
      id: `res-${Date.now()}`,
      ...data,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };
  }

  async updateReservationStatus(id: string, status: string) {
    return { id, status, updatedAt: new Date().toISOString() };
  }

  async getCalendar(year: number, month: number) {
    const visites = await this.getVisites();
    return visites.filter(v => {
      const d = new Date(v.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }
}
