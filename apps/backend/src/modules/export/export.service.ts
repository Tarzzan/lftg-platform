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
      Catégorie: i.category,
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
      orderBy: { name: 'asc' },
    });
    const headers = ['ID', 'Nom', 'Espèce', 'Sexe', 'Date naissance', 'Enclos', 'Statut'];
    const data = animals.map((a) => ({
      ID: a.id,
      Nom: a.name,
      Espèce: a.species?.name ?? '',
      Sexe: a.sex ?? '',
      'Date naissance': a.birthDate ? new Date(a.birthDate).toLocaleDateString('fr-FR') : '',
      Enclos: a.enclosure?.name ?? '',
      Statut: a.status,
    }));
    await this.exportToCsv(res, 'animaux.csv', headers, data);
  }

  // ... autres méthodes d'export ...
}
