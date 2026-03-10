import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KiosqueService {
  constructor(private prisma: PrismaService) {}

  async getTodayTasks(userId?: string) {
    return [
      {
        id: 'task-1',
        type: 'FEEDING',
        title: "Nourrissage Ara ararauna",
        animal: { id: 'anim-1', name: 'Bleu', species: 'Ara ararauna', enclos: 'Volière A' },
        scheduledAt: '2026-03-01T08:00:00Z',
        status: 'PENDING',
        priority: 'HIGH',
        assignedTo: userId || 'soigneur-1',
        notes: 'Fruits tropicaux + granulés premium',
        duration: 15,
      },
      {
        id: 'task-2',
        type: 'MEDICAL',
        title: "Pesée hebdomadaire — Boa constrictor",
        animal: { id: 'anim-2', name: 'Anaconda', species: 'Boa constrictor', enclos: 'Reptilarium B' },
        scheduledAt: '2026-03-01T09:30:00Z',
        status: 'PENDING',
        priority: 'NORMAL',
        assignedTo: userId || 'soigneur-1',
        notes: 'Peser et noter dans le dossier médical',
        duration: 20,
      },
      {
        id: 'task-3',
        type: 'CLEANING',
        title: "Nettoyage Volière B",
        animal: null,
        scheduledAt: "2026-03-01T10:00:00Z",
        status: 'IN_PROGRESS',
        priority: 'NORMAL',
        assignedTo: userId || 'soigneur-1',
        notes: 'Désinfection complète + remplacement litière',
        duration: 45,
      },
      {
        id: 'task-4',
        type: 'OBSERVATION',
        title: "Observation comportementale — Dendrobates",
        animal: { id: 'anim-3', name: 'Dendro', species: 'Dendrobates azureus', enclos: 'Amphibiens C' },
        scheduledAt: '2026-03-01T11:00:00Z',
        status: 'PENDING',
        priority: 'LOW',
        assignedTo: userId || 'soigneur-1',
        notes: 'Vérifier comportement reproducteur',
        duration: 30,
      },
      {
        id: 'task-5',
        type: 'FEEDING',
        title: "Nourrissage Caïman à lunettes",
        animal: { id: 'anim-4', name: 'Caïman', species: 'Caiman crocodilus', enclos: 'Bassin D' },
        scheduledAt: '2026-03-01T14:00:00Z',
        status: 'PENDING',
        priority: 'HIGH',
        assignedTo: userId || 'soigneur-1',
        notes: 'Poissons vivants uniquement — ATTENTION manipulation',
        duration: 25,
      },
    ];
  }

  async completeTask(taskId: string, data: { notes?: string; photos?: string[]; duration?: number }) {
    return {
      id: taskId,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      completionNotes: data.notes,
      photos: data.photos || [],
      actualDuration: data.duration,
    };
  }

  async quickScan(qrCode: string) {
    // Simule un scan QR code d'un animal
    return {
      type: 'ANIMAL',
      id: 'anim-1',
      name: 'Bleu',
      species: 'Ara ararauna',
      enclos: 'Volière A',
      lastFed: '2026-02-28T08:00:00Z',
      lastMedical: '2026-02-15T10:00:00Z',
      pendingTasks: 2,
      alerts: [],
      quickActions: ['FEED', 'WEIGH', 'OBSERVE', 'MEDICAL_NOTE'],
    };
  }

  async quickNote(animalId: string, note: string, type: string) {
    return {
      id: `note-${Date.now()}`,
      animalId,
      note,
      type,
      createdAt: new Date().toISOString(),
      createdBy: 'soigneur-1',
    };
  }

  async getAlerts() {
    return [
      {
        id: 'alert-1',
        type: 'MEDICAL',
        severity: 'HIGH',
        title: "Vaccination due — Ara ararauna \"Bleu\",
        description: "Rappel vaccinal prévu le 2026-03-03",
        animalId: 'anim-1',
        dueAt: '2026-03-03T00:00:00Z',
      },
      {
        id: 'alert-2',
        type: 'STOCK',
        severity: 'MEDIUM',
        title: "Stock critique — Granulés perroquets",
        description: "Seuil minimum atteint (2 kg restants)",
        dueAt: new Date().toISOString(),
      },
    ];
  }
}
