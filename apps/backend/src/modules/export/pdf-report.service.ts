// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service de génération de rapports PDF enrichis
 * Utilise du HTML/CSS inline converti en PDF via Puppeteer (si disponible)
 * ou retourne un HTML structuré pour conversion côté client
 */
@Injectable()
export class PdfReportService {
  private readonly logger = new Logger(PdfReportService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Rapport mensuel complet ──────────────────────────────────────────────

  async generateMonthlyReport(year: number, month: number): Promise<{ html: string; filename: string }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [animals, stockMovements, medicalVisits, workflowInstances] = await Promise.all([
      this.prisma.animal.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { species: true },
      }),
      this.prisma.stockMovement.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { item: true },
      }),
      this.prisma.medicalVisit.findMany({
        where: { visitDate: { gte: startDate, lte: endDate } },
        include: { animal: { include: { species: true } } },
      }),
      this.prisma.workflowInstance.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { definition: true },
      }),
    ]);

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const html = this.buildMonthlyReportHTML({
      year, month, monthName: monthNames[month - 1],
      animals, stockMovements, medicalVisits, workflowInstances,
    });

    return {
      html,
      filename: `rapport-lftg-${year}-${String(month).padStart(2, '0')}.html`,
    };
  }

  // ─── Rapport médical animal ───────────────────────────────────────────────

  async generateAnimalMedicalReport(animalId: string): Promise<{ html: string; filename: string }> {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        species: true,
        enclosure: true,
        medicalVisits: {
          include: { treatments: true, vaccinations: true },
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    if (!animal) throw new Error(`Animal ${animalId} introuvable`);

    const html = this.buildAnimalMedicalReportHTML(animal);

    return {
      html,
      filename: `dossier-medical-${animal.name.toLowerCase().replace(/\s+/g, '-')}.html`,
    };
  }

  // ─── Rapport inventaire stock ─────────────────────────────────────────────

  async generateStockInventoryReport(): Promise<{ html: string; filename: string }> {
    const articles = await this.prisma.stockItem.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const lowStock = articles.filter(a => a.quantity <= a.lowStockThreshold);
    const html = this.buildStockInventoryHTML({ articles, lowStock });

    return {
      html,
      filename: `inventaire-stock-${new Date().toISOString().split('T')[0]}.html`,
    };
  }

  // ─── Templates HTML ───────────────────────────────────────────────────────

  private buildBaseHTML(title: string, content: string): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset='UTF-8'>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #1f2937; background: white; font-size: 12px; line-height: 1.5; }
    .page { max-width: 210mm; margin: 0 auto; padding: 20mm; }
    .header { border-bottom: 3px solid #166534; padding-bottom: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
    .header-logo { font-size: 32px; }
    .header-title h1 { font-size: 20px; font-weight: 700; color: #166534; }
    .header-title p { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .header-meta { text-align: right; font-size: 10px; color: #6b7280; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 700; color: #166534; border-bottom: 1px solid #d1fae5; padding-bottom: 6px; margin-bottom: 12px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; text-align: center; }
    .stat-card .value { font-size: 24px; font-weight: 700; color: #166534; }
    .stat-card .label { font-size: 10px; color: #6b7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f0fdf4; color: #166534; padding: 6px 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #bbf7d0; }
    td { padding: 5px 8px; border-bottom: 1px solid #f3f4f6; }
    tr:hover td { background: #f9fafb; }
    .badge { display: inline-block; padding: 1px 6px; border-radius: 9999px; font-size: 10px; font-weight: 500; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fee2e2; color: #dc2626; }
    .badge-amber { background: #fef3c7; color: #d97706; }
    .badge-blue { background: #dbeafe; color: #2563eb; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
    .alert-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 10px 12px; margin: 8px 0; }
    .alert-box.danger { background: #fef2f2; border-color: #ef4444; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 10mm; }
    }
  </style>
</head>
<body>
  <div class='page'>
    ${content}
    <div class="footer">
      <p>🦜 LFTG Platform v3.0.0 — La Ferme Tropicale de Guyane — Généré le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>
</body>
</html>`;
  }

  private buildMonthlyReportHTML(data: any): string {
    const content = `
      <div class='header'>
        <div style="display:flex;align-items:center;gap:12px">
          <div class='header-logo'>🦜</div>
          <div class='header-title'>
            <h1>Rapport mensuel — ${data.monthName} ${data.year}</h1>
            <p>La Ferme Tropicale de Guyane · LFTG Platform</p>
          </div>
        </div>
        <div class='header-meta'>
          <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          <p>Période : 01/${String(data.month).padStart(2,'0')}/${data.year} — ${new Date(data.year, data.month, 0).getDate()}/${String(data.month).padStart(2,'0')}/${data.year}</p>
        </div>
      </div>

      <div class='stats-grid'>
        <div class='stat-card'>
          <div class="value">${data.animals.length}</div>
          <div class='label'>Nouveaux animaux</div>
        </div>
        <div class='stat-card'>
          <div class='value'>${data.medicalVisits.length}</div>
          <div class='label'>Visites médicales</div>
        </div>
        <div class='stat-card'>
          <div class="value">${data.stockMovements.length}</div>
          <div class='label'>Mouvements stock</div>
        </div>
        <div class='stat-card'>
          <div class='value'>${data.workflowInstances.length}</div>
          <div class='label'>Workflows lancés</div>
        </div>
      </div>

      ${data.medicalVisits.length > 0 ? `
      <div class='section'>
        <div class="section-title">Visites médicales</div>
        <table>
          <thead>
            <tr><th>Animal</th><th>Espèce</th><th>Type</th><th>Date</th><th>Vétérinaire</th><th>Diagnostic</th></tr>
          </thead>
          <tbody>
            ${data.medicalVisits.map((v: any) => `
              <tr>
                <td>${v.animal?.name || '—'}</td>
                <td>${v.animal?.species?.name || '—'}</td>
                <td><span class="badge badge-green">${v.type}</span></td>
                <td>${new Date(v.visitDate).toLocaleDateString('fr-FR')}</td>
                <td>${v.vetName}</td>
                <td>${v.diagnosis || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : ''}

      ${data.stockMovements.length > 0 ? `
      <div class='section'>
        <div class="section-title">Mouvements de stock</div>
        <table>
          <thead>
            <tr><th>Article</th><th>Type</th><th>Quantité</th><th>Date</th></tr>
          </thead>
          <tbody>
            ${data.stockMovements.map((m: any) => `
              <tr>
                <td>${m.item?.name || '—'}</td>
                <td><span class="badge ${m.type === 'ENTREE' ? 'badge-green' : 'badge-red'}">${m.type}</span></td>
                <td>${m.quantity} ${m.item?.unit || ''}</td>
                <td>${new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : ''}
    `;

    return this.buildBaseHTML(`Rapport mensuel ${data.monthName} ${data.year}`, content);
  }

  private buildAnimalMedicalReportHTML(animal: any): string {
    const content = `
      <div class='header'>
        <div style="display:flex;align-items:center;gap:12px">
          <div class='header-logo'>🦜</div>
          <div class="header-title">
            <h1>Dossier médical — ${animal.name}</h1>
            <p>${animal.species?.name}${animal.species?.scientificName ? ` (${animal.species.scientificName})` : ''}</p>
          </div>
        </div>
        <div class='header-meta'>
          <p>ID : ${animal.identifier || animal.id.slice(0, 8)}</p>
          <p>Statut : <span class="badge badge-green">${animal.status}</span></p>
        </div>
      </div>

      <div class='section'>
        <div class='section-title'>Informations générales</div>
        <table>
          <tr><th>Nom</th><td>${animal.name}</td><th>Sexe</th><td>${animal.sex}</td></tr>
          <tr><th>Espèce</th><td>${animal.species?.name}</td><th>Naissance</th><td>${animal.birthDate ? new Date(animal.birthDate).toLocaleDateString('fr-FR') : '—'}</td></tr>
          <tr><th>Enclos</th><td>${animal.enclosure?.name || '—'}</td><th>Total visites</th><td>${animal.medicalVisits?.length || 0}</td></tr>
        </table>
      </div>

      ${animal.medicalVisits?.length > 0 ? `
      <div class='section'>
        <div class='section-title'>Historique des visites (${animal.medicalVisits.length})</div>
        ${animal.medicalVisits.map((v: any) => `
          <div style="border:1px solid #e5e7eb;border-radius:6px;padding:10px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <strong>${new Date(v.visitDate).toLocaleDateString('fr-FR')} — ${v.type}</strong>
              <span>${v.vetName}</span>
            </div>
            ${v.diagnosis ? `<p><strong>Diagnostic :</strong> ${v.diagnosis}</p>` : ''}
            ${v.weight ? `<p><strong>Poids :</strong> ${v.weight} kg</p>` : ''}
            ${v.temperature ? `<p><strong>Température :</strong> ${v.temperature}°C</p>` : ''}
            ${v.notes ? `<p style="color:#6b7280;font-style:italic">${v.notes}</p>` : ''}
            ${v.treatments?.length > 0 ? `
              <div style="margin-top:6px;">
                <strong>Traitements :</strong>
                ${v.treatments.map((t: any) => `<span class="badge badge-amber" style="margin:2px">${t.name}${t.dosage ? ` — ${t.dosage}` : ''}</span>`).join('")}
              </div>` : ''}
            ${v.vaccinations?.length > 0 ? `
              <div style="margin-top:4px;">
                <strong>Vaccinations :</strong>
                ${v.vaccinations.map((vac: any) => `<span class="badge badge-blue" style="margin:2px">${vac.vaccine}</span>`).join('")}
              </div>` : ''}
          </div>
        `).join('')}
      </div>` : '<p style="color:#6b7280;font-style:italic">Aucune visite médicale enregistrée.</p>'}
    `;

    return this.buildBaseHTML(`Dossier médical — ${animal.name}`, content);
  }

  private buildStockInventoryHTML(data: any): string {
    const byCategory = data.articles.reduce((acc: any, a: any) => {
      if (!acc[a.category]) acc[a.category] = [];
      acc[a.category].push(a);
      return acc;
    }, {});

    const content = `
      <div class='header'>
        <div style="display:flex;align-items:center;gap:12px">
          <div class='header-logo'>📦</div>
          <div class="header-title">
            <h1>Inventaire du stock</h1>
            <p>La Ferme Tropicale de Guyane · LFTG Platform</p>
          </div>
        </div>
        <div class='header-meta'>
          <p>Date : ${new Date().toLocaleDateString('fr-FR')}</p>
          <p>${data.articles.length} articles · ${data.lowStock.length} en alerte</p>
        </div>
      </div>

      ${data.lowStock.length > 0 ? `
      <div class="alert-box danger" style="margin-bottom:16px">
        <strong>⚠️ ${data.lowStock.length} article${data.lowStock.length > 1 ? 's' : ''} en stock faible</strong>
        <p style="margin-top:4px">${data.lowStock.map((a: any) => a.name).join(', ")}</p>
      </div>` : ''}

      ${Object.entries(byCategory).map(([category, articles]: [string, any]) => `
      <div class='section'>
        <div class="section-title">${category} (${(articles as any[]).length})</div>
        <table>
          <thead>
            <tr><th>Article</th><th>Quantité</th><th>Unité</th><th>Seuil</th><th>Emplacement</th><th>Statut</th></tr>
          </thead>
          <tbody>
            ${(articles as any[]).map((a: any) => `
              <tr>
                <td>${a.name}</td>
                <td style="${a.quantity <= a.lowStockThreshold ? 'color:#dc2626;font-weight:600' : ''}">${a.quantity}</td>
                <td>${a.unit}</td>
                <td>${a.lowStockThreshold}</td>
                <td>${a.location || '—'}</td>
                <td><span class="badge ${a.quantity <= a.lowStockThreshold ? 'badge-red' : a.quantity <= a.lowStockThreshold * 1.5 ? 'badge-amber' : 'badge-green'}">${a.quantity <= a.lowStockThreshold ? 'Critique' : a.quantity <= a.lowStockThreshold * 1.5 ? 'Faible' : 'OK'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      `).join('')}
    `;

    return this.buildBaseHTML('Inventaire du stock', content);
  }
}
