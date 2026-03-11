import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fastcsv from 'fast-csv';
import { Response } from 'express';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  private async exportToCsv(res: Response, filename: string, headers: string[], data: any[]) {
    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    const csvStream = fastcsv.format({ headers: true });
    data.forEach(row => csvStream.write(row));
    csvStream.pipe(res);
    csvStream.end();
  }

  async exportStockCsv(res: Response): Promise<void> {
    const items = await this.prisma.stockItem.findMany({ orderBy: { name: 'asc' } });
    const headers = ['ID', 'Nom', 'Catégorie', 'Quantité', 'Unité', 'Seuil alerte', 'Statut'];
    const data = items.map((i) => ({
      ID: i.id,
      Nom: i.name,
      Catégorie: i.category ?? '',
      Quantité: i.quantity,
      Unité: i.unit,
      'Seuil alerte': i.lowStockThreshold,
      Statut: i.quantity <= i.lowStockThreshold ? 'ALERTE' : 'OK',
    }));
    await this.exportToCsv(res, 'stock.csv', headers, data);
  }

  async exportAnimauxCsv(res: Response): Promise<void> {
    const animals = await this.prisma.animal.findMany({
      include: { species: true, enclosure: true },
      orderBy: { createdAt: 'desc' },
    });
    const headers = ['ID', 'Identifiant', 'Nom', 'Espèce', 'Sexe', 'Date naissance', 'Enclos', 'Statut'];
    const data = animals.map((a) => ({
      ID: a.id,
      Identifiant: a.identifier,
      Nom: a.name ?? '',
      Espèce: a.species?.name ?? '',
      Sexe: a.sex ?? '',
      'Date naissance': a.birthDate ? new Date(a.birthDate).toLocaleDateString('fr-FR') : '',
      Enclos: a.enclosure?.name ?? '',
      Statut: a.status,
    }));
    await this.exportToCsv(res, 'animaux.csv', headers, data);
  }

  async exportPersonnelCsv(res: Response): Promise<void> {
    const employees = await this.prisma.employee.findMany({
      include: { skills: true },
      orderBy: { lastName: 'asc' },
    });
    const headers = ['ID', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Poste', 'Département', 'Date embauche', 'Compétences'];
    const data = employees.map((e) => ({
      ID: e.id,
      Prénom: e.firstName ?? '',
      Nom: e.lastName ?? '',
      Email: e.email ?? '',
      Téléphone: e.phone ?? '',
      Poste: e.jobTitle ?? '',
      Département: e.department ?? '',
      'Date embauche': e.hireDate ? new Date(e.hireDate).toLocaleDateString('fr-FR') : '',
      Compétences: e.skills.map((s) => s.name).join(', '),
    }));
    await this.exportToCsv(res, 'personnel.csv', headers, data);
  }

  async exportFormationCsv(res: Response): Promise<void> {
    const courses = await this.prisma.course.findMany({
      include: {
        chapters: { include: { lessons: true } },
        cohorts: { include: { _count: { select: { enrollments: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const headers = ['ID', 'Titre', 'Catégorie', 'Niveau', 'Durée (min)', 'Chapitres', 'Leçons', 'Cohortes', 'Publié', 'Créé le'];
    const data = courses.map((c) => {
      const totalLessons = c.chapters.reduce((s, ch) => s + ch.lessons.length, 0);
      const totalEnrollments = c.cohorts.reduce((s, co) => s + co._count.enrollments, 0);
      return {
        ID: c.id,
        Titre: c.title,
        Catégorie: c.category ?? '',
        Niveau: c.level ?? '',
        'Durée (min)': c.duration ?? '',
        Chapitres: c.chapters.length,
        Leçons: totalLessons,
        Cohortes: c.cohorts.length,
        Publié: c.isPublished ? 'Oui' : 'Non',
        'Créé le': new Date(c.createdAt).toLocaleDateString('fr-FR'),
      };
    });
    await this.exportToCsv(res, 'formation.csv', headers, data);
  }

  async exportAuditCsv(res: Response, limit = 1000): Promise<void> {
    const logs = await this.prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    const headers = ['ID', 'Date', 'Utilisateur', 'Email', 'Action', 'Sujet', 'Détails'];
    const data = logs.map((l) => ({
      ID: l.id,
      Date: new Date(l.timestamp).toLocaleString('fr-FR'),
      Utilisateur: l.user?.name ?? '',
      Email: l.user?.email ?? '',
      Action: l.action,
      Sujet: l.subject,
      Détails: l.details ? JSON.stringify(l.details) : '',
    }));
    await this.exportToCsv(res, 'audit.csv', headers, data);
  }

  async exportStockReport(res: Response): Promise<void> {
    // Rapport stock avec mouvements récents
    const items = await this.prisma.stockItem.findMany({
      include: { movements: { orderBy: { timestamp: 'desc' }, take: 5 } },
      orderBy: { name: 'asc' },
    });
    const headers = ['ID', 'Nom', 'Quantité', 'Unité', 'Seuil', 'Statut', 'Derniers mouvements'];
    const data = items.map((i) => ({
      ID: i.id,
      Nom: i.name,
      Quantité: i.quantity,
      Unité: i.unit,
      Seuil: i.lowStockThreshold,
      Statut: i.quantity <= i.lowStockThreshold ? 'ALERTE' : 'OK',
      'Derniers mouvements': i.movements.map((m) => `${m.type}:${m.quantity}`).join(' | '),
    }));
    await this.exportToCsv(res, 'stock-report.csv', headers, data);
  }
}
