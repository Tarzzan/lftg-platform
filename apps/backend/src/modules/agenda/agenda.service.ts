// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AgendaEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  type: 'MEDICAL' | 'FEEDING' | 'CLEANING' | 'TRAINING' | 'INSPECTION' | 'OTHER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  animalId?: string;
  enclosureId?: string;
  assignedToId?: string;
  recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceEnd?: string;
  reminderMinutes?: number;
}

@Injectable()
export class AgendaService {
  constructor(private prisma: PrismaService) {}

  async getEvents(params: {
    startDate?: string;
    endDate?: string;
    type?: string;
    assignedToId?: string;
    animalId?: string;
  }) {
    const where: any = {};

    if (params.startDate || params.endDate) {
      where.startDate = {};
      if (params.startDate) where.startDate.gte = new Date(params.startDate);
      if (params.endDate) where.startDate.lte = new Date(params.endDate);
    }
    if (params.type) where.type = params.type;
    if (params.assignedToId) where.assignedToId = params.assignedToId;
    if (params.animalId) where.animalId = params.animalId;

    return this.prisma.agendaEvent.findMany({
      where,
      include: {
        animal: { select: { id: true, name: true } },
        enclosure: { select: { id: true, name: true, code: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async getEventById(id: string) {
    return this.prisma.agendaEvent.findUnique({
      where: { id },
      include: {
        animal: true,
        enclosure: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async createEvent(dto: AgendaEventDto, createdById: string) {
    const event = await this.prisma.agendaEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        allDay: dto.allDay || false,
        type: dto.type,
        priority: dto.priority,
        animalId: dto.animalId,
        enclosureId: dto.enclosureId,
        assignedToId: dto.assignedToId,
        recurrence: dto.recurrence || 'NONE',
        recurrenceEnd: dto.recurrenceEnd ? new Date(dto.recurrenceEnd) : null,
        reminderMinutes: dto.reminderMinutes || 30,
        createdById,
        status: 'PENDING',
      },
    });

    // Générer les occurrences si récurrence
    if (dto.recurrence && dto.recurrence !== 'NONE') {
      await this.generateRecurrences(event.id, dto);
    }

    return event;
  }

  async updateEvent(id: string, dto: Partial<AgendaEventDto>) {
    return this.prisma.agendaEvent.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        recurrenceEnd: dto.recurrenceEnd ? new Date(dto.recurrenceEnd) : undefined,
      },
    });
  }

  async completeEvent(id: string, notes?: string) {
    return this.prisma.agendaEvent.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completionNotes: notes,
      },
    });
  }

  async deleteEvent(id: string) {
    return this.prisma.agendaEvent.delete({ where: { id } });
  }

  async getUpcomingReminders(minutesAhead = 60) {
    const now = new Date();
    const future = new Date(now.getTime() + minutesAhead * 60 * 1000);

    return this.prisma.agendaEvent.findMany({
      where: {
        startDate: { gte: now, lte: future },
        status: 'PENDING',
        reminderSent: false,
      },
      include: {
        assignedTo: { select: { id: true, email: true, firstName: true } },
        animal: { select: { name: true } },
      },
    });
  }

  async exportToICal(params: { startDate?: string; endDate?: string; userId?: string }): Promise<string> {
    const events = await this.getEvents({
      startDate: params.startDate,
      endDate: params.endDate,
      assignedToId: params.userId,
    });

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LFTG Platform//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:LFTG - Agenda des soins',
      'X-WR-TIMEZONE:America/Cayenne',
      'X-WR-CALDESC:Calendrier des soins et événements de La Ferme Tropicale de Guyane',
    ];

    for (const event of events) {
      const uid = `${event.id}@lftg.fr`;
      const dtstart = this.formatICalDate(event.startDate, event.allDay);
      const dtend = event.endDate
        ? this.formatICalDate(event.endDate, event.allDay)
        : this.formatICalDate(new Date(event.startDate.getTime() + 3600000), event.allDay);

      const typeEmoji = {
        MEDICAL: '🩺', FEEDING: '🌿', CLEANING: '🧹',
        TRAINING: '📚', INSPECTION: '🔍', OTHER: '📌',
      }[event.type] || '📌';

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${this.formatICalDate(new Date())}`);
      lines.push(`DTSTART:${dtstart}`);
      lines.push(`DTEND:${dtend}`);
      lines.push(`SUMMARY:${typeEmoji} ${this.escapeICalText(event.title)}`);
      if (event.description) {
        lines.push(`DESCRIPTION:${this.escapeICalText(event.description)}`);
      }
      if (event.animal) {
        lines.push(`LOCATION:${this.escapeICalText(`Animal: ${event.animal.name}`)}`);
      }
      if (event.enclosure) {
        lines.push(`LOCATION:${this.escapeICalText(`Enclos: ${event.enclosure.name} (${event.enclosure.code})`)}`);
      }

      // Priorité
      const priorityMap = { LOW: 9, NORMAL: 5, HIGH: 3, URGENT: 1 };
      lines.push(`PRIORITY:${priorityMap[event.priority] || 5}`);

      // Rappel
      if (event.reminderMinutes) {
        lines.push('BEGIN:VALARM');
        lines.push('TRIGGER:-PT' + event.reminderMinutes + 'M');
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:Rappel: ${event.title}`);
        lines.push('END:VALARM');
      }

      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  private formatICalDate(date: Date, allDay = false): string {
    if (allDay) {
      return date.toISOString().replace(/[-:]/g, '').split('T')[0];
    }
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  private escapeICalText(text: string): string {
    return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  private async generateRecurrences(eventId: string, dto: AgendaEventDto): Promise<void> {
    const start = new Date(dto.startDate);
    const end = dto.recurrenceEnd ? new Date(dto.recurrenceEnd) : new Date(start.getTime() + 90 * 24 * 3600000);
    const occurrences: Date[] = [];

    let current = new Date(start);
    let count = 0;
    const maxOccurrences = 52; // Max 52 occurrences

    while (current <= end && count < maxOccurrences) {
      if (dto.recurrence === 'DAILY') current = new Date(current.getTime() + 24 * 3600000);
      else if (dto.recurrence === 'WEEKLY') current = new Date(current.getTime() + 7 * 24 * 3600000);
      else if (dto.recurrence === 'MONTHLY') {
        current = new Date(current);
        current.setMonth(current.getMonth() + 1);
      }

      if (current <= end) {
        occurrences.push(new Date(current));
        count++;
      }
    }

    // Créer les occurrences en base
    for (const occDate of occurrences) {
      await this.prisma.agendaEvent.create({
        data: {
          title: dto.title,
          description: dto.description,
          startDate: occDate,
          endDate: dto.endDate ? new Date(occDate.getTime() + (new Date(dto.endDate).getTime() - new Date(dto.startDate).getTime())) : null,
          allDay: dto.allDay || false,
          type: dto.type,
          priority: dto.priority,
          animalId: dto.animalId,
          enclosureId: dto.enclosureId,
          assignedToId: dto.assignedToId,
          recurrence: 'NONE', // Les occurrences n'ont pas de sous-récurrence
          reminderMinutes: dto.reminderMinutes || 30,
          parentEventId: eventId,
          status: 'PENDING',
        },
      });
    }
  }
}
