// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory = 'MEDICAL' | 'EQUIPMENT' | 'SECURITY' | 'STOCK' | 'ANIMAL' | 'INFRASTRUCTURE' | 'OTHER';

export interface CreateTicketDto {
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  assigneeId?: string;
  animalId?: string;
  enclosureId?: string;
  dueDate?: string;
}

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  private mockTickets = [
    {
      id: 'ticket-1',
      reference: 'TKT-2026-001',
      title: 'Fuite dans l\'enclos des reptiles',
      description: 'Une fuite d\'eau a été détectée dans le système de brumisation de l\'enclos reptilarium. Risque de court-circuit.',
      status: 'IN_PROGRESS' as TicketStatus,
      priority: 'HIGH' as TicketPriority,
      category: 'INFRASTRUCTURE' as TicketCategory,
      createdBy: { id: 'user-2', name: 'Marie Dupont', avatar: '👩‍🔬' },
      assignee: { id: 'user-4', name: 'Jean Martin', avatar: '📦' },
      animalId: null,
      enclosureId: 'enc-3',
      enclosureName: 'Reptilarium',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      comments: [
        { id: 'c-1', authorName: 'Jean Martin', content: 'Intervention planifiée pour demain matin', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      ],
    },
    {
      id: 'ticket-2',
      reference: 'TKT-2026-002',
      title: 'Ara Bleu — comportement anormal',
      description: 'L\'Ara Bleu (E-03) présente des signes d\'agitation inhabituelle depuis ce matin. Possible stress ou début de maladie.',
      status: 'OPEN' as TicketStatus,
      priority: 'CRITICAL' as TicketPriority,
      category: 'MEDICAL' as TicketCategory,
      createdBy: { id: 'user-2', name: 'Marie Dupont', avatar: '👩‍🔬' },
      assignee: { id: 'user-3', name: 'Dr. Rousseau', avatar: '👨‍⚕️' },
      animalId: 'animal-3',
      animalName: 'Ara Bleu (E-03)',
      enclosureId: null,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      comments: [],
    },
    {
      id: 'ticket-3',
      reference: 'TKT-2026-003',
      title: 'Stock graines tournesol épuisé',
      description: 'Le stock de graines de tournesol est épuisé. Commande urgente nécessaire pour maintenir l\'alimentation des perroquets.',
      status: 'RESOLVED' as TicketStatus,
      priority: 'HIGH' as TicketPriority,
      category: 'STOCK' as TicketCategory,
      createdBy: { id: 'user-4', name: 'Jean Martin', avatar: '📦' },
      assignee: { id: 'user-1', name: 'William MERI', avatar: '👨‍💼' },
      animalId: null,
      enclosureId: null,
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      comments: [
        { id: 'c-2', authorName: 'William MERI', content: 'Commande passée auprès du fournisseur Amazonie Bio', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        { id: 'c-3', authorName: 'Jean Martin', content: 'Livraison reçue et rangée en entrepôt', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
      ],
    },
    {
      id: 'ticket-4',
      reference: 'TKT-2026-004',
      title: 'Serrure enclos Volière A défectueuse',
      description: 'La serrure de sécurité de la Volière A ne se ferme plus correctement. Risque d\'évasion.',
      status: 'OPEN' as TicketStatus,
      priority: 'CRITICAL' as TicketPriority,
      category: 'SECURITY' as TicketCategory,
      createdBy: { id: 'user-5', name: 'Sophie Bernard', avatar: '👩‍🎓' },
      assignee: { id: 'user-4', name: 'Jean Martin', avatar: '📦' },
      animalId: null,
      enclosureId: 'enc-1',
      enclosureName: 'Volière A',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      comments: [],
    },
    {
      id: 'ticket-5',
      reference: 'TKT-2026-005',
      title: 'Lampe UV reptilarium à remplacer',
      description: 'La lampe UV de l\'enclos reptilarium est grillée. Les reptiles ont besoin de lumière UV pour leur métabolisme.',
      status: 'CLOSED' as TicketStatus,
      priority: 'MEDIUM' as TicketPriority,
      category: 'EQUIPMENT' as TicketCategory,
      createdBy: { id: 'user-3', name: 'Dr. Rousseau', avatar: '👨‍⚕️' },
      assignee: { id: 'user-4', name: 'Jean Martin', avatar: '📦' },
      animalId: null,
      enclosureId: 'enc-3',
      enclosureName: 'Reptilarium',
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      comments: [
        { id: 'c-4', authorName: 'Jean Martin', content: 'Lampe remplacée par modèle Arcadia T5 HO 12%', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      ],
    },
  ];

  async findAll(filters?: { status?: TicketStatus; priority?: TicketPriority; category?: TicketCategory }) {
    let tickets = [...this.mockTickets];
    if (filters?.status) tickets = tickets.filter(t => t.status === filters.status);
    if (filters?.priority) tickets = tickets.filter(t => t.priority === filters.priority);
    if (filters?.category) tickets = tickets.filter(t => t.category === filters.category);

    const stats = {
      total: this.mockTickets.length,
      open: this.mockTickets.filter(t => t.status === 'OPEN').length,
      inProgress: this.mockTickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: this.mockTickets.filter(t => t.status === 'RESOLVED').length,
      closed: this.mockTickets.filter(t => t.status === 'CLOSED').length,
      critical: this.mockTickets.filter(t => t.priority === 'CRITICAL').length,
    };

    return { tickets, stats };
  }

  async findOne(id: string) {
    return this.mockTickets.find(t => t.id === id) || null;
  }

  async create(userId: string, dto: CreateTicketDto) {
    const ticket = {
      id: `ticket-${Date.now()}`,
      reference: `TKT-2026-${String(this.mockTickets.length + 1).padStart(3, '0')}`,
      ...dto,
      status: 'OPEN' as TicketStatus,
      createdBy: { id: userId, name: 'William MERI', avatar: '👨‍💼' },
      assignee: dto.assigneeId ? { id: dto.assigneeId, name: 'Assigné', avatar: '👤' } : null,
      animalName: null,
      enclosureName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };
    this.mockTickets.unshift(ticket);
    return ticket;
  }

  async updateStatus(id: string, status: TicketStatus) {
    const ticket = this.mockTickets.find(t => t.id === id);
    if (ticket) ticket.status = status;
    return ticket;
  }

  async addComment(id: string, userId: string, content: string) {
    const ticket = this.mockTickets.find(t => t.id === id);
    if (ticket) {
      const comment = {
        id: `c-${Date.now()}`,
        authorName: 'William MERI',
        content,
        createdAt: new Date().toISOString(),
      };
      ticket.comments.push(comment);
      return comment;
    }
    return null;
  }
}
