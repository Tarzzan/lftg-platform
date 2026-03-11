// @ts-nocheck
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ImportResult {
  success: number;
  errors: number;
  skipped: number;
  details: Array<{ row: number; status: 'success' | 'error' | 'skipped'; message?: string }>;
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Parser CSV générique ─────────────────────────────────────────────────

  private parseCSV(content: string): Array<Record<string, string>> {
    const lines = content.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new BadRequestException('Le fichier CSV doit contenir au moins un en-tête et une ligne de données');

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const rows: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
      rows.push(row);
    }

    return rows;
  }

  // ─── Import animaux ───────────────────────────────────────────────────────

  async importAnimals(csvContent: string, userId: string): Promise<ImportResult> {
    const rows = this.parseCSV(csvContent);
    const result: ImportResult = { success: 0, errors: 0, skipped: 0, details: [] };

    // Colonnes attendues : name, identifier, species_name, sex, birth_date, status, enclosure_name, notes
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        if (!row.name || !row.species_name) {
          result.errors++;
          result.details.push({ row: rowNum, status: 'error', message: 'Colonnes "name" et "species_name" obligatoires' });
          continue;
        }

        // Trouver ou créer l'espèce
        let species = await this.prisma.species.findFirst({
          where: { name: { equals: row.species_name, mode: 'insensitive' } },
        });
        if (!species) {
          species = await this.prisma.species.create({
            data: { name: row.species_name, scientificName: row.scientific_name || row.species_name },
          });
        }

        // Trouver l'enclos si précisé
        let enclosureId: string | undefined;
        if (row.enclosure_name) {
          const enclosure = await this.prisma.enclosure.findFirst({
            where: { name: { equals: row.enclosure_name, mode: 'insensitive' } },
          });
          if (enclosure) enclosureId = enclosure.id;
        }

        // Vérifier si l'animal existe déjà (par identifier)
        if (row.identifier) {
          const existing = await this.prisma.animal.findFirst({ where: { identifier: row.identifier } });
          if (existing) {
            result.skipped++;
            result.details.push({ row: rowNum, status: 'skipped', message: `Animal avec l'identifiant "${row.identifier}" existe déjà` });
            continue;
          }
        }

        await this.prisma.animal.create({
          data: {
            name: row.name,
            identifier: row.identifier || undefined,
            speciesId: species.id,
            sex: (row.sex?.toUpperCase() as any) || 'UNKNOWN',
            birthDate: row.birth_date ? new Date(row.birth_date) : undefined,
            status: (row.status?.toUpperCase() as any) || 'ACTIVE',
            enclosureId: enclosureId || undefined,
            notes: row.notes || undefined,
          },
        });

        result.success++;
        result.details.push({ row: rowNum, status: 'success', message: `Animal "${row.name}" importé` });
      } catch (error: any) {
        result.errors++;
        result.details.push({ row: rowNum, status: 'error', message: error.message });
        this.logger.error(`Import animal row ${rowNum}: ${error.message}`);
      }
    }

    this.logger.log(`Import animaux terminé: ${result.success} succès, ${result.errors} erreurs, ${result.skipped} ignorés`);
    return result;
  }

  // ─── Import articles de stock ─────────────────────────────────────────────

  async importStockArticles(csvContent: string, userId: string): Promise<ImportResult> {
    const rows = this.parseCSV(csvContent);
    const result: ImportResult = { success: 0, errors: 0, skipped: 0, details: [] };

    // Colonnes attendues : name, category, quantity, unit, threshold, location, description
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        if (!row.name) {
          result.errors++;
          result.details.push({ row: rowNum, status: 'error', message: 'Colonne "name" obligatoire' });
          continue;
        }

        // Vérifier si l'article existe déjà
        const existing = await this.prisma.stockArticle.findFirst({
          where: { name: { equals: row.name, mode: 'insensitive' } },
        });
        if (existing) {
          result.skipped++;
          result.details.push({ row: rowNum, status: 'skipped', message: `Article "${row.name}" existe déjà` });
          continue;
        }

        await this.prisma.stockArticle.create({
          data: {
            name: row.name,
            category: row.category || 'AUTRE',
            quantity: parseFloat(row.quantity) || 0,
            unit: row.unit || 'unité',
            threshold: parseFloat(row.threshold) || 0,
            location: row.location || undefined,
            description: row.description || undefined,
          },
        });

        result.success++;
        result.details.push({ row: rowNum, status: 'success', message: `Article "${row.name}" importé` });
      } catch (error: any) {
        result.errors++;
        result.details.push({ row: rowNum, status: 'error', message: error.message });
      }
    }

    return result;
  }

  // ─── Import utilisateurs ──────────────────────────────────────────────────

  async importUsers(csvContent: string, userId: string): Promise<ImportResult> {
    const rows = this.parseCSV(csvContent);
    const result: ImportResult = { success: 0, errors: 0, skipped: 0, details: [] };

    // Colonnes attendues : email, name, role
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        if (!row.email) {
          result.errors++;
          result.details.push({ row: rowNum, status: 'error', message: 'Colonne "email" obligatoire' });
          continue;
        }

        const existing = await this.prisma.user.findUnique({ where: { email: row.email } });
        if (existing) {
          result.skipped++;
          result.details.push({ row: rowNum, status: 'skipped', message: `Utilisateur "${row.email}" existe déjà` });
          continue;
        }

        // Import avec mot de passe temporaire
        const bcrypt = await import('bcryptjs');
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await this.prisma.user.create({
          data: {
            email: row.email,
            name: row.name || row.email.split('@')[0],
            password: hashedPassword,
            isActive: true,
          },
        });

        result.success++;
        result.details.push({ row: rowNum, status: 'success', message: `Utilisateur "${row.email}" importé (mot de passe temporaire: ${tempPassword})` });
      } catch (error: any) {
        result.errors++;
        result.details.push({ row: rowNum, status: 'error', message: error.message });
      }
    }

    return result;
  }

  // ─── Templates CSV ────────────────────────────────────────────────────────

  getTemplate(type: 'animals' | 'stock' | 'users'): string {
    const templates: Record<string, string> = {
      animals: 'name,identifier,species_name,scientific_name,sex,birth_date,status,enclosure_name,notes\nPerroquet Amazone,PA-001,Amazone à front bleu,Amazona aestiva,MALE,2020-03-15,ACTIVE,Volière A,Né en captivité',
      stock: 'name,category,quantity,unit,threshold,location,description\nGraines de tournesol,NOURRITURE,50,kg,10,Entrepôt A,Alimentation perroquets',
      users: 'email,name,role\nsoigneur@lftg.fr,Jean Dupont,soigneur',
    };
    return templates[type] || '';
  }
}
