import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface CreateConversationDto {
  participantIds: string[];
  name?: string;
  type: 'DIRECT' | 'GROUP' | 'ZONE';
  zone?: string;
}

export interface SendMessageDto {
  conversationId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE' | 'ALERT';
  attachmentUrl?: string;
}

@Injectable()
export class MessagingService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getConversations(userId: string) {
    // Simulated conversations data
    return [
      {
        id: 'conv-1',
        name: 'Équipe Soins',
        type: 'GROUP',
        zone: 'Volière A+B',
        participants: [
          { id: 'user-1', name: 'William MERI', avatar: '👨‍💼', role: 'Directeur' },
          { id: 'user-2', name: 'Marie Dupont', avatar: '👩‍🔬', role: 'Soigneur' },
          { id: 'user-5', name: 'Sophie Bernard', avatar: '👩‍🎓', role: 'Soigneur' },
        ],
        lastMessage: {
          content: 'Le perroquet Amazona a été nourri à 8h30',
          senderId: 'user-2',
          senderName: 'Marie Dupont',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        unreadCount: 2,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      {
        id: 'conv-2',
        name: 'Urgences Médicales',
        type: 'GROUP',
        zone: 'Infirmerie',
        participants: [
          { id: 'user-1', name: 'William MERI', avatar: '👨‍💼', role: 'Directeur' },
          { id: 'user-3', name: 'Dr. Rousseau', avatar: '👨‍⚕️', role: 'Vétérinaire' },
        ],
        lastMessage: {
          content: '⚠️ Dendrobate en observation — fièvre légère',
          senderId: 'user-3',
          senderName: 'Dr. Rousseau',
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        unreadCount: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: 'conv-3',
        name: 'Marie Dupont',
        type: 'DIRECT',
        participants: [
          { id: 'user-1', name: 'William MERI', avatar: '👨‍💼', role: 'Directeur' },
          { id: 'user-2', name: 'Marie Dupont', avatar: '👩‍🔬', role: 'Soigneur' },
        ],
        lastMessage: {
          content: 'Rapport de la semaine envoyé',
          senderId: 'user-1',
          senderName: 'William MERI',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      },
      {
        id: 'conv-4',
        name: 'Logistique & Stock',
        type: 'GROUP',
        zone: 'Entrepôt',
        participants: [
          { id: 'user-1', name: 'William MERI', avatar: '👨‍💼', role: 'Directeur' },
          { id: 'user-4', name: 'Jean Martin', avatar: '📦', role: 'Logistique' },
        ],
        lastMessage: {
          content: 'Stock de graines de tournesol critique — commande urgente',
          senderId: 'user-4',
          senderName: 'Jean Martin',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        },
        unreadCount: 3,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
    ];
  }

  async getMessages(conversationId: string, page = 1, limit = 50) {
    const messagesByConv: Record<string, any[]> = {
      'conv-1': [
        { id: 'm-1', conversationId: 'conv-1', senderId: 'user-2', senderName: 'Marie Dupont', senderAvatar: '👩‍🔬', content: 'Bonjour ! Soins du matin terminés pour la Volière A', type: 'TEXT', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), readBy: ['user-1', 'user-5'] },
        { id: 'm-2', conversationId: 'conv-1', senderId: 'user-5', senderName: 'Sophie Bernard', senderAvatar: '👩‍🎓', content: 'Parfait ! Je prends en charge la Volière B', type: 'TEXT', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(), readBy: ['user-1', 'user-2'] },
        { id: 'm-3', conversationId: 'conv-1', senderId: 'user-1', senderName: 'William MERI', senderAvatar: '👨‍💼', content: 'Merci à tous. N\'oubliez pas la pesée mensuelle cet après-midi à 14h', type: 'TEXT', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), readBy: ['user-2', 'user-5'] },
        { id: 'm-4', conversationId: 'conv-1', senderId: 'user-2', senderName: 'Marie Dupont', senderAvatar: '👩‍🔬', content: 'Le perroquet Amazona a été nourri à 8h30', type: 'TEXT', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), readBy: [] },
      ],
      'conv-2': [
        { id: 'm-5', conversationId: 'conv-2', senderId: 'user-3', senderName: 'Dr. Rousseau', senderAvatar: '👨‍⚕️', content: 'Visite de routine terminée. Tous les animaux en bonne santé.', type: 'TEXT', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), readBy: ['user-1'] },
        { id: 'm-6', conversationId: 'conv-2', senderId: 'user-3', senderName: 'Dr. Rousseau', senderAvatar: '👨‍⚕️', content: '⚠️ Dendrobate en observation — fièvre légère', type: 'ALERT', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), readBy: [] },
      ],
    };

    return {
      messages: messagesByConv[conversationId] || [],
      total: (messagesByConv[conversationId] || []).length,
      page,
      limit,
    };
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const message = {
      id: `m-${Date.now()}`,
      conversationId: dto.conversationId,
      senderId: userId,
      senderName: 'William MERI',
      senderAvatar: '👨‍💼',
      content: dto.content,
      type: dto.type || 'TEXT',
      attachmentUrl: dto.attachmentUrl,
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    // Notify via SSE
    this.notifications.sendToAll({
      type: 'NEW_MESSAGE',
      data: message,
    });

    return message;
  }

  async createConversation(userId: string, dto: CreateConversationDto) {
    return {
      id: `conv-${Date.now()}`,
      ...dto,
      createdAt: new Date().toISOString(),
      unreadCount: 0,
    };
  }

  async markAsRead(conversationId: string, userId: string) {
    return { success: true, conversationId, userId };
  }

  async getUnreadCount(userId: string) {
    return { total: 6, byConversation: { 'conv-1': 2, 'conv-2': 1, 'conv-4': 3 } };
  }
}
