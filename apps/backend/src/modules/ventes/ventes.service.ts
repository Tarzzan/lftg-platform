// @ts-nocheck
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

export type SaleStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type SaleType = 'ANIMAL' | 'PRODUCT' | 'SERVICE' | 'FORMATION';

export interface CreateSaleDto {
  type: SaleType;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  items: SaleItemDto[];
  notes?: string;
  paymentMethod?: string;
  dueDate?: string;
}

export interface SaleItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
  animalId?: string;
  taxRate?: number;
}

export interface UpdateSaleDto {
  status?: SaleStatus;
  notes?: string;
  paymentMethod?: string;
  paymentDate?: string;
}

@Injectable()
export class VentesService {
  private readonly logger = new Logger(VentesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ─── CRUD Ventes ──────────────────────────────────────────────────────────

  async findAll(filters?: {
    status?: SaleStatus;
    type?: SaleType;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.search) {
      where.OR = [
        { buyerName: { contains: filters.search, mode: 'insensitive' } },
        { buyerEmail: { contains: filters.search, mode: 'insensitive' } },
        { reference: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: {
          items: {
            include: { animal: { select: { id: true, name: true, identifier: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: { animal: { include: { species: true } } },
        },
      },
    });

    if (!sale) throw new NotFoundException(`Vente ${id} introuvable`);
    return sale;
  }

  async create(dto: CreateSaleDto, userId: string) {
    // Calculer les totaux
    const subtotal = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = dto.items.reduce((sum, item) => {
      const taxRate = item.taxRate ?? 0;
      return sum + item.quantity * item.unitPrice * (taxRate / 100);
    }, 0);
    const total = subtotal + taxAmount;

    // Générer une référence unique
    const reference = `LFTG-${Date.now().toString(36).toUpperCase()}`;

    const sale = await this.prisma.sale.create({
      data: {
        reference,
        type: dto.type,
        status: 'PENDING',
        buyerName: dto.buyerName,
        buyerEmail: dto.buyerEmail,
        buyerPhone: dto.buyerPhone,
        buyerAddress: dto.buyerAddress,
        subtotal,
        taxAmount,
        total,
        notes: dto.notes,
        paymentMethod: dto.paymentMethod,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        createdById: userId,
        items: {
          create: dto.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate ?? 0,
            total: item.quantity * item.unitPrice * (1 + (item.taxRate ?? 0) / 100),
            animalId: item.animalId,
          })),
        },
      },
      include: { items: true },
    });

    await this.auditService.log({
      userId,
      action: 'CREATE',
      resource: 'Sale',
      resourceId: sale.id,
      details: `Vente créée : ${reference} — ${dto.buyerName} — ${total.toFixed(2)}€`,
    });

    this.notificationsService.emit('sale.created', {
      message: `Nouvelle vente ${reference} — ${dto.buyerName} — ${total.toFixed(2)}€`,
      type: 'success',
    });

    return sale;
  }

  async updateStatus(id: string, dto: UpdateSaleDto, userId: string) {
    const sale = await this.findOne(id);

    const updated = await this.prisma.sale.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.paymentMethod && { paymentMethod: dto.paymentMethod }),
        ...(dto.paymentDate && { paymentDate: new Date(dto.paymentDate) }),
        ...(dto.status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      resource: 'Sale',
      resourceId: id,
      details: `Vente ${sale.reference} — statut : ${dto.status}`,
    });

    // Si vente complétée avec des animaux, mettre à jour leur statut
    if (dto.status === 'COMPLETED') {
      const animalItems = sale.items.filter((item: any) => item.animalId);
      for (const item of animalItems) {
        await this.prisma.animal.update({
          where: { id: item.animalId },
          data: { status: 'VENDU' },
        });
      }

      this.notificationsService.emit('sale.completed', {
        message: `Vente ${sale.reference} complétée — ${sale.total.toFixed(2)}€`,
        type: 'success',
      });
    }

    return updated;
  }

  async cancel(id: string, userId: string) {
    const sale = await this.findOne(id);

    if (['COMPLETED', 'CANCELLED'].includes(sale.status)) {
      throw new Error(`Impossible d'annuler une vente ${sale.status}`);
    }

    await this.prisma.sale.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      resource: 'Sale',
      resourceId: id,
      details: `Vente ${sale.reference} annulée`,
    });

    return { success: true };
  }

  // ─── Statistiques ─────────────────────────────────────────────────────────

  async getStats(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
      default: startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [total, completed, pending, revenue, byType] = await Promise.all([
      this.prisma.sale.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.sale.count({ where: { status: 'COMPLETED', createdAt: { gte: startDate } } }),
      this.prisma.sale.count({ where: { status: 'PENDING', createdAt: { gte: startDate } } }),
      this.prisma.sale.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: startDate } },
        _sum: { total: true },
      }),
      this.prisma.sale.groupBy({
        by: ['type'],
        where: { createdAt: { gte: startDate } },
        _count: true,
        _sum: { total: true },
      }),
    ]);

    return {
      total,
      completed,
      pending,
      revenue: revenue._sum.total || 0,
      byType: byType.map(t => ({
        type: t.type,
        count: t._count,
        revenue: t._sum.total || 0,
      })),
    };
  }

  // ─── Génération de devis/facture HTML ─────────────────────────────────────

  async generateInvoiceHtml(id: string): Promise<string> {
    const sale = await this.findOne(id);

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset='UTF-8'>
  <title>Facture ${sale.reference}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #1f2937; font-size: 12px; }
    .page { max-width: 210mm; margin: 0 auto; padding: 20mm; }
    .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .logo { font-size: 28px; }
    .company h1 { font-size: 18px; font-weight: 700; color: #166534; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { font-size: 22px; font-weight: 700; color: #166534; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .party h3 { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #f0fdf4; padding: 8px; text-align: left; font-size: 11px; color: #166534; border-bottom: 2px solid #bbf7d0; }
    td { padding: 7px 8px; border-bottom: 1px solid #f3f4f6; }
    .totals { margin-left: auto; width: 260px; }
    .totals tr td:first-child { color: #6b7280; }
    .totals tr td:last-child { text-align: right; font-weight: 600; }
    .total-row td { font-size: 14px; font-weight: 700; color: #166534; border-top: 2px solid #166534; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
    .status { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .status-COMPLETED { background: #dcfce7; color: #166534; }
    .status-PENDING { background: #fef3c7; color: #d97706; }
    .status-CANCELLED { background: #fee2e2; color: #dc2626; }
    @media print { body { print-color-adjust: exact; } }
  </style>
</head>
<body>
<div class='page'>
  <div class='header'>
    <div>
      <div class='logo'>🦜</div>
      <div class='company'>
        <h1>La Ferme Tropicale de Guyane</h1>
        <p>LFTG Platform</p>
        <p>Guyane française</p>
      </div>
    </div>
    <div class="invoice-info">
      <h2>FACTURE</h2>
      <p><strong>Réf :</strong> ${sale.reference}</p>
      <p><strong>Date :</strong> ${new Date(sale.createdAt).toLocaleDateString('fr-FR')}</p>
      ${sale.dueDate ? `<p><strong>Échéance :</strong> ${new Date(sale.dueDate).toLocaleDateString('fr-FR')}</p>` : ''}
      <span class="status status-${sale.status}">${sale.status}</span>
    </div>
  </div>

  <div class='parties'>
    <div class="party">
      <h3>Vendeur</h3>
      <p><strong>La Ferme Tropicale de Guyane</strong></p>
      <p>LFTG Platform</p>
    </div>
    <div class='party'>
      <h3>Acheteur</h3>
      <p><strong>${sale.buyerName}</strong></p>
      ${sale.buyerEmail ? `<p>${sale.buyerEmail}</p>` : ''}
      ${sale.buyerPhone ? `<p>${sale.buyerPhone}</p>` : ''}
      ${sale.buyerAddress ? `<p>${sale.buyerAddress}</p>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center">Qté</th>
        <th style="text-align:right">Prix unitaire</th>
        <th style="text-align:center">TVA</th>
        <th style="text-align:right">Total HT</th>
      </tr>
    </thead>
    <tbody>
      ${(sale.items as any[]).map(item => `
        <tr>
          <td>${item.description}${item.animal ? ` <em style="color:#6b7280">(${item.animal.name})</em>` : ''}</td>
          <td style="text-align:center">${item.quantity}</td>
          <td style="text-align:right">${item.unitPrice.toFixed(2)} €</td>
          <td style="text-align:center">${item.taxRate}%</td>
          <td style="text-align:right">${(item.quantity * item.unitPrice).toFixed(2)} €</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <table class='totals'>
    <tr><td>Sous-total HT</td><td>${sale.subtotal.toFixed(2)} €</td></tr>
    <tr><td>TVA</td><td>${sale.taxAmount.toFixed(2)} €</td></tr>
    <tr class="total-row"><td>Total TTC</td><td>${sale.total.toFixed(2)} €</td></tr>
  </table>

  ${sale.notes ? `<div style="margin-top:16px;padding:10px;background:#f9fafb;border-radius:6px;font-size:11px"><strong>Notes :</strong> ${sale.notes}</div>` : ''}

  <div class="footer">
    <p>🦜 La Ferme Tropicale de Guyane — LFTG Platform v4.0.0 — Facture générée le ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>
</div>
</body>
</html>`;
  }
}
