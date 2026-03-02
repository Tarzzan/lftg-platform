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
  score?: number;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, limit = 20): Promise<{ results: SearchResult[]; total: number }> {
    if (!query || query.trim().length < 2) {
      return { results: [], total: 0 };
    }

    const q = query.trim().toLowerCase();
    const results: SearchResult[] = [];

    // ─── Animaux ─────────────────────────────────────────────────────────────
    const animals = await this.prisma.animal.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { identifier: { contains: q, mode: 'insensitive' } },
          { notes: { contains: q, mode: 'insensitive' } },
        ],
        deletedAt: null,
      },
      include: { species: { select: { commonName: true } } },
      take: 5,
    });

    animals.forEach(a => results.push({
      id: a.id,
      type: 'animal',
      title: a.name,
      subtitle: a.species?.commonName,
      meta: `ID: ${a.identifier} · ${a.status}`,
      url: `/admin/animaux/${a.id}`,
    }));

    // ─── Espèces ──────────────────────────────────────────────────────────────
    const species = await this.prisma.species.findMany({
      where: {
        OR: [
          { commonName: { contains: q, mode: 'insensitive' } },
          { scientificName: { contains: q, mode: 'insensitive' } },
          { family: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 3,
    });

    species.forEach(s => results.push({
      id: s.id,
      type: 'species',
      title: s.commonName,
      subtitle: s.scientificName,
      meta: `${s.family} · CITES: ${s.citesAppendix || 'Non listé'}`,
      url: `/admin/animaux/especes`,
    }));

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

    enclosures.forEach(e => results.push({
      id: e.id,
      type: 'enclosure',
      title: e.name,
      subtitle: `Code: ${e.code}`,
      meta: `Capacité: ${e.capacity} · ${e.type}`,
      url: `/admin/animaux/enclos/${e.id}`,
    }));

    // ─── Stock ────────────────────────────────────────────────────────────────
    const stockItems = await this.prisma.stockArticle.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { reference: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 3,
    });

    stockItems.forEach(s => results.push({
      id: s.id,
      type: 'stock',
      title: s.name,
      subtitle: `Réf: ${s.reference}`,
      meta: `Stock: ${s.quantity} ${s.unit}`,
      url: `/admin/stock/articles`,
    }));

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

    sales.forEach(s => results.push({
      id: s.id,
      type: 'sale',
      title: s.reference,
      subtitle: s.buyerName,
      meta: `${s.totalTTC?.toFixed(2)} € · ${s.status}`,
      url: `/admin/ventes/${s.id}`,
    }));

    // ─── Utilisateurs ─────────────────────────────────────────────────────────
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      take: 3,
    });

    users.forEach(u => results.push({
      id: u.id,
      type: 'user',
      title: `${u.firstName} ${u.lastName}`,
      subtitle: u.email,
      meta: u.isActive ? 'Actif' : 'Inactif',
      url: `/admin/users`,
    }));

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

    courses.forEach(c => results.push({
      id: c.id,
      type: 'course',
      title: c.title,
      subtitle: c.description?.substring(0, 60),
      meta: `${c.level} · ${c.durationHours}h`,
      url: `/admin/formation/cours`,
    }));

    // ─── Workflows ────────────────────────────────────────────────────────────
    const workflows = await this.prisma.workflowInstance.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 2,
    });

    workflows.forEach(w => results.push({
      id: w.id,
      type: 'workflow',
      title: w.title,
      subtitle: w.description?.substring(0, 60),
      meta: `${w.status} · ${w.currentStep}`,
      url: `/admin/workflows/${w.id}`,
    }));

    // ─── Trier par pertinence (titre exact en premier) ────────────────────────
    const sorted = results.sort((a, b) => {
      const aExact = a.title.toLowerCase().startsWith(q) ? 1 : 0;
      const bExact = b.title.toLowerCase().startsWith(q) ? 1 : 0;
      return bExact - aExact;
    });

    return { results: sorted.slice(0, limit), total: sorted.length };
  }

  async searchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();

    const [animals, species, stock] = await Promise.all([
      this.prisma.animal.findMany({
        where: { name: { contains: q, mode: 'insensitive' }, deletedAt: null },
        select: { name: true },
        take: 3,
      }),
      this.prisma.species.findMany({
        where: { commonName: { contains: q, mode: 'insensitive' } },
        select: { commonName: true },
        take: 2,
      }),
      this.prisma.stockArticle.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { name: true },
        take: 2,
      }),
    ]);

    const suggestions = [
      ...animals.map(a => a.name),
      ...species.map(s => s.commonName),
      ...stock.map(s => s.name),
    ];

    return [...new Set(suggestions)].slice(0, 7);
  }
}
