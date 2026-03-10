// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchResult {
  id: string;
  type: 'animal' | 'species' | 'enclosure' | 'stock' | 'sale' | 'user' | 'course' | 'workflow';
  title: string;
  subtitle?: string;
  meta?: string;
  url: string;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, limit = 20): Promise<{ results: SearchResult[]; total: number }> {
    if (!query || query.trim().length < 2) {
      return { results: [], total: 0 };
    }
    const q = query.trim();
    const results: SearchResult[] = [];

    // ─── Animaux ─────────────────────────────────────────────────────────────
    const animals = await this.prisma.animal.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { identifier: { contains: q, mode: 'insensitive' } },
          { notes: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { species: { select: { commonName: true } } },
      take: 5,
    });
    animals.forEach((a) =>
      results.push({
        id: a.id,
        type: 'animal',
        title: a.name || a.identifier,
        subtitle: a.species?.commonName,
        meta: `ID: ${a.identifier} · ${a.status}`,
        url: `/admin/animaux/${a.id}`,
      }),
    );

    // ─── Espèces ──────────────────────────────────────────────────────────────
    const species = await this.prisma.species.findMany({
      where: {
        OR: [
          { commonName: { contains: q, mode: 'insensitive' } },
          { scientificName: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 3,
    });
    species.forEach((s) =>
      results.push({
        id: s.id,
        type: 'species',
        title: s.commonName,
        subtitle: s.scientificName,
        meta: `CITES: ${s.citesAppendix || 'Non listé'} · ${s.conservationStatus || ''}`,
        url: `/admin/animaux/especes`,
      }),
    );

    // ─── Enclos ───────────────────────────────────────────────────────────────
    const enclosures = await this.prisma.enclosure.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 3,
    });
    enclosures.forEach((e) =>
      results.push({
        id: e.id,
        type: 'enclosure',
        title: e.name,
        subtitle: `Code: ${e.code}`,
        meta: `Capacité: ${e.capacity} · ${e.type}`,
        url: `/admin/animaux/enclos/${e.id}`,
      }),
    );

    // ─── Stock ────────────────────────────────────────────────────────────────
    const stockItems = await this.prisma.stockItem.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { reference: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 3,
    });
    stockItems.forEach((s) =>
      results.push({
        id: s.id,
        type: 'stock',
        title: s.name,
        subtitle: `Réf: ${s.reference || 'N/A'}`,
        meta: `Stock: ${s.quantity} ${s.unit || ''}`,
        url: `/admin/stock/articles`,
      }),
    );

    // ─── Ventes ───────────────────────────────────────────────────────────────
    const sales = await this.prisma.sale.findMany({
      where: {
        OR: [
          { reference: { contains: q, mode: 'insensitive' } },
          { buyerName: { contains: q, mode: 'insensitive' } },
          { buyerEmail: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 3,
    });
    sales.forEach((s) =>
      results.push({
        id: s.id,
        type: 'sale',
        title: s.reference,
        subtitle: s.buyerName || '',
        meta: `${s.total?.toFixed(2) ?? '0.00'} € · ${s.status}`,
        url: `/admin/ventes/${s.id}`,
      }),
    );

    // ─── Utilisateurs ─────────────────────────────────────────────────────────
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      take: 3,
    });
    users.forEach((u) =>
      results.push({
        id: u.id,
        type: 'user',
        title: u.name || u.email,
        subtitle: u.email,
        meta: u.isActive ? 'Actif' : 'Inactif',
        url: `/admin/users`,
      }),
    );

    // ─── Cours de formation ───────────────────────────────────────────────────
    const courses = await this.prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 2,
    });
    courses.forEach((c) =>
      results.push({
        id: c.id,
        type: 'course',
        title: c.title,
        subtitle: c.description?.substring(0, 60),
        meta: `${c.level} · ${Math.round((c.duration || 0) / 60)}h`,
        url: `/admin/formation/cours`,
      }),
    );

    // ─── Workflows ────────────────────────────────────────────────────────────
    const workflows = await this.prisma.workflowInstance.findMany({
      where: {
        OR: [
          { entityId: { contains: q, mode: 'insensitive' } },
          { currentState: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 2,
    });
    workflows.forEach((w) =>
      results.push({
        id: w.id,
        type: 'workflow',
        title: `Workflow ${w.id.substring(0, 8)}`,
        subtitle: `État: ${w.currentState}`,
        meta: `Entité: ${w.entityId}`,
        url: `/admin/workflows/${w.id}`,
      }),
    );

    const sorted = results.sort((a, b) => {
      const aExact = a.title.toLowerCase().startsWith(q.toLowerCase()) ? 1 : 0;
      const bExact = b.title.toLowerCase().startsWith(q.toLowerCase()) ? 1 : 0;
      return bExact - aExact;
    });

    return { results: sorted.slice(0, limit), total: sorted.length };
  }

  async searchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const [animals, species, stock] = await Promise.all([
      this.prisma.animal.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { name: true },
        take: 3,
      }),
      this.prisma.species.findMany({
        where: { commonName: { contains: q, mode: 'insensitive' } },
        select: { commonName: true },
        take: 2,
      }),
      this.prisma.stockItem.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { name: true },
        take: 2,
      }),
    ]);
    const suggestions = [
      ...animals.map((a) => a.name).filter(Boolean),
      ...species.map((s) => s.commonName).filter(Boolean),
      ...stock.map((s) => s.name).filter(Boolean),
    ];
    return [...new Set(suggestions)].slice(0, 7);
  }
}
