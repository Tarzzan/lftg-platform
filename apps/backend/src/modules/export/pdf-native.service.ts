import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class PdfNativeService {
  private readonly logger = new Logger(PdfNativeService.name);
  private readonly tmpDir = '/tmp/lftg-reports';

  constructor(private readonly prisma: PrismaService) {
    // Créer le répertoire temporaire si nécessaire
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }
  }

  // ─── Rapport mensuel complet ───────────────────────────────────────────────

  async generateMonthlyReport(year: number, month: number): Promise<Buffer> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const monthName = startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const [animals, broods, stockMovements, sales, medicalEvents] = await Promise.all([
      this.prisma.animal.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      this.prisma.brood.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      this.prisma.stockMovement.count({ where: { timestamp: { gte: startDate, lte: endDate } } }),
      this.prisma.sale.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { items: true },
      }),
      this.prisma.animalEvent.count({
        where: { timestamp: { gte: startDate, lte: endDate }, type: 'MEDICAL' },
      }),
    ]);

    const totalRevenue = sales
      .filter(s => s.status === 'COMPLETED')
      .reduce((sum, s) => sum + s.total, 0);

    const totalAnimals = await this.prisma.animal.count({ where: { status: 'ACTIF' } });
    const totalEnclos = await this.prisma.enclosure.count({ where: { status: 'ACTIVE' } });

    const html = this.buildMonthlyReportHtml({
      monthName, year, month,
      newAnimals: animals, newBroods: broods,
      stockMovements, totalRevenue,
      salesCount: sales.length, medicalEvents,
      totalAnimals, totalEnclos,
      sales,
    });

    return this.htmlToPdf(html, `rapport-mensuel-${year}-${month}`);
  }

  // ─── Dossier médical d'un animal ──────────────────────────────────────────

  async generateAnimalMedicalRecord(animalId: string): Promise<Buffer> {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        species: true,
        enclosure: true,
        events: {
          where: { type: 'MEDICAL' },
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!animal) throw new Error(`Animal ${animalId} introuvable`);

    const html = this.buildAnimalMedicalHtml(animal);
    return this.htmlToPdf(html, `dossier-medical-${animal.identifier}`);
  }

  // ─── Inventaire du stock ──────────────────────────────────────────────────

  async generateStockInventory(): Promise<Buffer> {
    const items = await this.prisma.stockItem.findMany({
      include: {
        movements: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
      orderBy: { name: 'asc' },
    });

    const html = this.buildStockInventoryHtml(items);
    return this.htmlToPdf(html, `inventaire-stock-${Date.now()}`);
  }

  // ─── Rapport des ventes ───────────────────────────────────────────────────

  async generateSalesReport(dateFrom: string, dateTo: string): Promise<Buffer> {
    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo),
        },
      },
      include: {
        items: { include: { animal: true } },
        createdBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const html = this.buildSalesReportHtml(sales, dateFrom, dateTo);
    return this.htmlToPdf(html, `rapport-ventes-${dateFrom}-${dateTo}`);
  }

  // ─── Conversion HTML → PDF ────────────────────────────────────────────────

  private async htmlToPdf(html: string, filename: string): Promise<Buffer> {
    const htmlPath = path.join(this.tmpDir, `${filename}.html`);
    const pdfPath = path.join(this.tmpDir, `${filename}.pdf`);

    fs.writeFileSync(htmlPath, html, 'utf-8');

    try {
      // Essayer wkhtmltopdf en premier
      await execAsync(
        `wkhtmltopdf --quiet --page-size A4 --margin-top 15mm --margin-bottom 15mm --margin-left 15mm --margin-right 15mm "${htmlPath}" "${pdfPath}"`,
        { timeout: 30000 },
      );
    } catch {
      try {
        // Fallback : WeasyPrint
        await execAsync(`weasyprint "${htmlPath}" "${pdfPath}"`, { timeout: 30000 });
      } catch {
        // Fallback final : retourner le HTML comme buffer
        this.logger.warn('PDF generation tools unavailable, returning HTML');
        return Buffer.from(html, 'utf-8');
      }
    }

    const buffer = fs.readFileSync(pdfPath);

    // Nettoyage
    try {
      fs.unlinkSync(htmlPath);
      fs.unlinkSync(pdfPath);
    } catch { /* ignore */ }

    return buffer;
  }

  // ─── Templates HTML ───────────────────────────────────────────────────────

  private getBaseStyles(): string {
    return `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937; font-size: 11px; line-height: 1.5; }
      .page { max-width: 210mm; margin: 0 auto; padding: 15mm; }
      h1 { font-size: 22px; color: #166534; margin-bottom: 4px; }
      h2 { font-size: 15px; color: #166534; margin: 20px 0 8px; border-bottom: 2px solid #bbf7d0; padding-bottom: 4px; }
      h3 { font-size: 12px; color: #374151; margin: 12px 0 6px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #166534; }
      .logo { font-size: 32px; }
      .subtitle { color: #6b7280; font-size: 10px; margin-top: 2px; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; }
      .badge-green { background: #dcfce7; color: #166534; }
      .badge-yellow { background: #fef3c7; color: #d97706; }
      .badge-red { background: #fee2e2; color: #dc2626; }
      .badge-blue { background: #dbeafe; color: #1d4ed8; }
      .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
      .kpi { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; text-align: center; }
      .kpi-value { font-size: 24px; font-weight: 700; color: #166534; }
      .kpi-label { font-size: 10px; color: #6b7280; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10px; }
      th { background: #f0fdf4; padding: 6px 8px; text-align: left; font-size: 10px; color: #166534; border-bottom: 2px solid #bbf7d0; font-weight: 700; }
      td { padding: 5px 8px; border-bottom: 1px solid #f3f4f6; }
      tr:nth-child(even) td { background: #fafafa; }
      .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #9ca3af; text-align: center; }
      @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    `;
  }

  private buildMonthlyReportHtml(data: any): string {
    const { monthName, newAnimals, newBroods, stockMovements, totalRevenue, salesCount, medicalEvents, totalAnimals, totalEnclos, sales } = data;

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rapport mensuel — ${monthName}</title>
<style>${this.getBaseStyles()}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">🦜</div>
      <h1>Rapport Mensuel</h1>
      <p class="subtitle">${monthName} — La Ferme Tropicale de Guyane</p>
    </div>
    <div style="text-align:right">
      <p style="font-size:10px;color:#6b7280">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
      <p style="font-size:10px;color:#6b7280">LFTG Platform v4.0.0</p>
    </div>
  </div>

  <h2>Indicateurs clés du mois</h2>
  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-value">${totalAnimals}</div><div class="kpi-label">Animaux actifs</div></div>
    <div class="kpi"><div class="kpi-value">${newAnimals}</div><div class="kpi-label">Nouveaux animaux</div></div>
    <div class="kpi"><div class="kpi-value">${totalEnclos}</div><div class="kpi-label">Enclos actifs</div></div>
    <div class="kpi"><div class="kpi-value">${newBroods}</div><div class="kpi-label">Nouvelles couvées</div></div>
    <div class="kpi"><div class="kpi-value">${medicalEvents}</div><div class="kpi-label">Actes médicaux</div></div>
    <div class="kpi"><div class="kpi-value">${stockMovements}</div><div class="kpi-label">Mouvements stock</div></div>
    <div class="kpi"><div class="kpi-value">${salesCount}</div><div class="kpi-label">Ventes</div></div>
    <div class="kpi"><div class="kpi-value">${totalRevenue.toFixed(0)} €</div><div class="kpi-label">Chiffre d'affaires</div></div>
  </div>

  <h2>Ventes du mois</h2>
  ${sales.length > 0 ? `
  <table>
    <thead><tr><th>Référence</th><th>Acheteur</th><th>Type</th><th>Statut</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>
      ${sales.slice(0, 20).map((s: any) => `
        <tr>
          <td><strong>${s.reference}</strong></td>
          <td>${s.buyerName}</td>
          <td>${s.type}</td>
          <td><span class="badge ${s.status === 'COMPLETED' ? 'badge-green' : s.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}">${s.status}</span></td>
          <td style="text-align:right">${s.total.toFixed(2)} €</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p style="color:#6b7280;font-style:italic">Aucune vente ce mois-ci.</p>"}

  <div class="footer">
    🦜 La Ferme Tropicale de Guyane — LFTG Platform v4.0.0 — Rapport généré automatiquement
  </div>
</div>
</body>
</html>`;
  }

  private buildAnimalMedicalHtml(animal: any): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Dossier médical — ${animal.name || animal.identifier}</title>
<style>${this.getBaseStyles()}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">🦜</div>
      <h1>Dossier Médical</h1>
      <p class="subtitle">${animal.name || 'Sans nom'} (${animal.identifier}) — ${animal.species?.name}</p>
    </div>
    <div style="text-align:right">
      <p style="font-size:10px;color:#6b7280">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
    </div>
  </div>

  <h2>Informations générales</h2>
  <table>
    <tbody>
      <tr><td><strong>Identifiant</strong></td><td>${animal.identifier}</td><td><strong>Nom</strong></td><td>${animal.name || '—'}</td></tr>
      <tr><td><strong>Espèce</strong></td><td>${animal.species?.name || '—'}</td><td><strong>Sexe</strong></td><td>${animal.sex || '—'}</td></tr>
      <tr><td><strong>Date de naissance</strong></td><td>${animal.birthDate ? new Date(animal.birthDate).toLocaleDateString('fr-FR') : '—'}</td><td><strong>Statut</strong></td><td><span class="badge ${animal.status === 'ACTIF' ? 'badge-green' : 'badge-red'}">${animal.status}</span></td></tr>
      <tr><td><strong>Enclos</strong></td><td>${animal.enclosure?.name || '—'}</td><td><strong>Microchip</strong></td><td>${animal.microchipId || '—'}</td></tr>
    </tbody>
  </table>

  <h2>Historique médical (${animal.events?.length || 0} actes)</h2>
  ${animal.events?.length > 0 ? `
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Notes</th></tr></thead>
    <tbody>
      ${animal.events.map((e: any) => `
        <tr>
          <td>${new Date(e.timestamp).toLocaleDateString('fr-FR')}</td>
          <td><span class="badge badge-blue">${e.type}</span></td>
          <td>${e.notes || '—'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p style="color:#6b7280;font-style:italic">Aucun acte médical enregistré.</p>"}

  <div class="footer">
    🦜 La Ferme Tropicale de Guyane — LFTG Platform v4.0.0 — Dossier confidentiel
  </div>
</div>
</body>
</html>`;
  }

  private buildStockInventoryHtml(items: any[]): string {
    const lowStock = items.filter(i => i.quantity <= i.lowStockThreshold);

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Inventaire du stock</title>
<style>${this.getBaseStyles()}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">🦜</div>
      <h1>Inventaire du Stock</h1>
      <p class="subtitle">La Ferme Tropicale de Guyane — ${new Date().toLocaleDateString('fr-FR')}</p>
    </div>
    <div style="text-align:right">
      <p>${items.length} articles · <span style="color:#dc2626">${lowStock.length} en alerte</span></p>
    </div>
  </div>

  ${lowStock.length > 0 ? `
  <h2 style="color:#dc2626">⚠️ Articles en alerte de stock (${lowStock.length})</h2>
  <table>
    <thead><tr><th>Article</th><th>Catégorie</th><th>Quantité</th><th>Seuil</th><th>Unité</th></tr></thead>
    <tbody>
      ${lowStock.map(i => `
        <tr style="background:#fff7f7">
          <td><strong>${i.name}</strong></td>
          <td>${i.category || '—'}</td>
          <td style="color:#dc2626;font-weight:700">${i.quantity}</td>
          <td>${i.lowStockThreshold}</td>
          <td>${i.unit}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <h2>Inventaire complet</h2>
  <table>
    <thead><tr><th>Article</th><th>Catégorie</th><th>Quantité</th><th>Unité</th><th>Emplacement</th><th>Statut</th></tr></thead>
    <tbody>
      ${items.map(i => `
        <tr>
          <td><strong>${i.name}</strong></td>
          <td>${i.category || '—'}</td>
          <td style="${i.quantity <= i.lowStockThreshold ? 'color:#dc2626;font-weight:700' : ''}">${i.quantity}</td>
          <td>${i.unit}</td>
          <td>${i.location || '—'}</td>
          <td><span class="badge ${i.quantity <= i.lowStockThreshold ? 'badge-red' : 'badge-green'}">${i.quantity <= i.lowStockThreshold ? 'ALERTE' : 'OK'}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    🦜 La Ferme Tropicale de Guyane — LFTG Platform v4.0.0 — Inventaire généré le ${new Date().toLocaleDateString('fr-FR')}
  </div>
</div>
</body>
</html>`;
  }

  private buildSalesReportHtml(sales: any[], dateFrom: string, dateTo: string): string {
    const completed = sales.filter(s => s.status === 'COMPLETED');
    const totalRevenue = completed.reduce((sum, s) => sum + s.total, 0);

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rapport des ventes</title>
<style>${this.getBaseStyles()}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">🦜</div>
      <h1>Rapport des Ventes</h1>
      <p class="subtitle">Du ${new Date(dateFrom).toLocaleDateString('fr-FR')} au ${new Date(dateTo).toLocaleDateString('fr-FR')}</p>
    </div>
    <div style="text-align:right">
      <p style="font-size:16px;font-weight:700;color:#166534">${totalRevenue.toFixed(2)} €</p>
      <p style="font-size:10px;color:#6b7280">${completed.length} ventes complétées</p>
    </div>
  </div>

  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi"><div class="kpi-value">${sales.length}</div><div class="kpi-label">Total ventes</div></div>
    <div class="kpi"><div class="kpi-value">${completed.length}</div><div class="kpi-label">Complétées</div></div>
    <div class="kpi"><div class="kpi-value">${totalRevenue.toFixed(0)} €</div><div class="kpi-label">Chiffre d'affaires</div></div>
  </div>

  <h2>Détail des ventes</h2>
  <table>
    <thead><tr><th>Référence</th><th>Date</th><th>Acheteur</th><th>Type</th><th>Statut</th><th style="text-align:right">Total TTC</th></tr></thead>
    <tbody>
      ${sales.map(s => `
        <tr>
          <td><strong>${s.reference}</strong></td>
          <td>${new Date(s.createdAt).toLocaleDateString('fr-FR')}</td>
          <td>${s.buyerName}</td>
          <td>${s.type}</td>
          <td><span class="badge ${s.status === 'COMPLETED' ? 'badge-green' : s.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}">${s.status}</span></td>
          <td style="text-align:right;font-weight:600">${s.total.toFixed(2)} €</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    🦜 La Ferme Tropicale de Guyane — LFTG Platform v4.0.0 — Rapport confidentiel
  </div>
</div>
</body>
</html>`;
  }
}
