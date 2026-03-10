// @ts-nocheck
import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface CreatePartnerDto {
  name: string;
  email: string;
  type: 'eleveur' | 'veterinaire' | 'zoo' | 'association' | 'recherche';
  permissions: string[];
  contactName: string;
  phone?: string;
  website?: string;
  description?: string;
}

export interface PartnerApiKey {
  id: string;
  name: string;
  apiKey: string;
  secretKey: string;
  permissions: string[];
  createdAt: string;
  expiresAt: string;
}

@Injectable()
export class PartnersService {
  private readonly logger = new Logger(PartnersService.name);

  // Stockage en mémoire pour la démo (en production : table Prisma dédiée)
  private partners: Array<{
    id: string;
    name: string;
    email: string;
    type: string;
    contactName: string;
    phone?: string;
    website?: string;
    description?: string;
    apiKey: string;
    secretKey: string;
    permissions: string[];
    status: 'active' | 'suspended' | 'pending';
    createdAt: string;
    expiresAt: string;
    lastUsed?: string;
    requestCount: number;
  }> = [
    {
      id: 'partner_001',
      name: 'Zoo de Guyane',
      email: 'contact@zoo-guyane.fr',
      type: 'zoo',
      contactName: 'Dr. Pierre Martin',
      phone: '+594 594 123 456',
      website: 'https://zoo-guyane.fr',
      description: "Partenaire officiel pour les échanges d'animaux",
      apiKey: 'lftg_pk_zoo_guyane_2026',
      secretKey: 'lftg_sk_' + crypto.randomBytes(16).toString('hex'),
      permissions: ['animals:read', 'species:read', 'cites:read'],
      status: 'active',
      createdAt: '2026-01-15T10:00:00Z',
      expiresAt: '2027-01-15T10:00:00Z',
      lastUsed: '2026-03-01T08:30:00Z',
      requestCount: 1247,
    },
    {
      id: 'partner_002',
      name: 'Clinique Vétérinaire Amazonie',
      email: 'dr.dupont@clinique-amazonie.fr',
      type: 'veterinaire',
      contactName: 'Dr. Sophie Dupont',
      phone: '+594 594 789 012',
      website: 'https://clinique-amazonie.fr',
      description: "Accès aux dossiers médicaux pour consultations externes",
      apiKey: 'lftg_pk_clinique_amazonie_2026',
      secretKey: 'lftg_sk_' + crypto.randomBytes(16).toString('hex'),
      permissions: ['animals:read', 'medical:read', 'medical:write'],
      status: 'active',
      createdAt: '2026-02-01T09:00:00Z',
      expiresAt: '2027-02-01T09:00:00Z',
      lastUsed: '2026-02-28T14:15:00Z',
      requestCount: 342,
    },
    {
      id: 'partner_003',
      name: 'CNRS Biodiversité Amazonie',
      email: 'recherche@cnrs-amazonie.fr',
      type: 'recherche',
      contactName: 'Prof. Jean-Luc Bernard',
      website: 'https://cnrs-amazonie.fr',
      description: "Programme de recherche sur la biodiversité guyanaise",
      apiKey: "lftg_pk_cnrs_amazonie_2026",
      secretKey: 'lftg_sk_' + crypto.randomBytes(16).toString('hex'),
      permissions: ['animals:read', 'species:read', 'elevage:read', 'cites:read'],
      status: 'active',
      createdAt: '2026-01-20T11:00:00Z',
      expiresAt: '2027-01-20T11:00:00Z',
      lastUsed: '2026-03-01T16:45:00Z',
      requestCount: 5621,
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.partners.map(p => ({
      ...p,
      secretKey: '***hidden***',
    }));
  }

  async findOne(id: string) {
    const partner = this.partners.find(p => p.id === id);
    if (!partner) throw new NotFoundException(`Partenaire ${id} introuvable`);
    return { ...partner, secretKey: '***hidden***' };
  }

  async create(dto: CreatePartnerDto): Promise<PartnerApiKey> {
    const id = `partner_${Date.now()}`;
    const apiKey = `lftg_pk_${dto.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().getFullYear()}`;
    const secretKey = `lftg_sk_${crypto.randomBytes(24).toString('hex')}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 365 * 24 * 3600000).toISOString();

    const partner = {
      id,
      ...dto,
      apiKey,
      secretKey,
      status: 'active' as const,
      createdAt: now,
      expiresAt,
      requestCount: 0,
    };

    this.partners.push(partner);
    this.logger.log(`Partenaire créé: ${dto.name} (${id})`);

    return { id, name: dto.name, apiKey, secretKey, permissions: dto.permissions, createdAt: now, expiresAt };
  }

  async suspend(id: string) {
    const partner = this.partners.find(p => p.id === id);
    if (!partner) throw new NotFoundException(`Partenaire ${id} introuvable`);
    partner.status = 'suspended';
    this.logger.warn(`Partenaire suspendu: ${partner.name}`);
    return { success: true, message: `Partenaire ${partner.name} suspendu` };
  }

  async activate(id: string) {
    const partner = this.partners.find(p => p.id === id);
    if (!partner) throw new NotFoundException(`Partenaire ${id} introuvable`);
    partner.status = 'active';
    return { success: true, message: `Partenaire ${partner.name} activé` };
  }

  async rotateApiKey(id: string): Promise<PartnerApiKey> {
    const partner = this.partners.find(p => p.id === id);
    if (!partner) throw new NotFoundException(`Partenaire ${id} introuvable`);

    partner.apiKey = `lftg_pk_${partner.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    partner.secretKey = `lftg_sk_${crypto.randomBytes(24).toString('hex')}`;

    this.logger.log(`Clés API renouvelées pour: ${partner.name}`);
    return {
      id: partner.id,
      name: partner.name,
      apiKey: partner.apiKey,
      secretKey: partner.secretKey,
      permissions: partner.permissions,
      createdAt: partner.createdAt,
      expiresAt: partner.expiresAt,
    };
  }

  async validateApiKey(apiKey: string, secretKey: string) {
    const partner = this.partners.find(p => p.apiKey === apiKey && p.secretKey === secretKey);
    if (!partner) throw new UnauthorizedException('Clés API invalides');
    if (partner.status !== 'active') throw new UnauthorizedException('Partenaire suspendu');
    if (new Date(partner.expiresAt) < new Date()) throw new UnauthorizedException('Clés API expirées');

    partner.lastUsed = new Date().toISOString();
    partner.requestCount++;

    return { valid: true, partnerId: partner.id, permissions: partner.permissions };
  }

  async getStats() {
    const active = this.partners.filter(p => p.status === 'active').length;
    const totalRequests = this.partners.reduce((sum, p) => sum + p.requestCount, 0);

    return {
      total: this.partners.length,
      active,
      suspended: this.partners.filter(p => p.status === 'suspended').length,
      pending: this.partners.filter(p => p.status === 'pending').length,
      totalApiRequests: totalRequests,
      topPartners: this.partners
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 5)
        .map(p => ({ name: p.name, requests: p.requestCount, type: p.type })),
      byType: {
        zoo: this.partners.filter(p => p.type === 'zoo').length,
        veterinaire: this.partners.filter(p => p.type === 'veterinaire').length,
        eleveur: this.partners.filter(p => p.type === 'eleveur').length,
        recherche: this.partners.filter(p => p.type === 'recherche').length,
        association: this.partners.filter(p => p.type === 'association').length,
      },
    };
  }
}
