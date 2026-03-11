// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PdfPuppeteerService {
  private readonly logger = new Logger(PdfPuppeteerService.name);

  constructor(private prisma: PrismaService) {}

  // ─── Rapport mensuel complet ──────────────────────────────────────────────
  async generateMonthlyReport(year: number, month: number): Promise<Buffer> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [animals, sales, medicalVisits, stockMovements, workflows] = await Promise.all([
      this.prisma.animal.count({ where: { status: 'ALIVE', deletedAt: null } }),
      this.prisma.sale.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { items: true },
      }),
      this.prisma.medicalVisit.findMany({
        where: { visitDate: { gte: startDate, lte: endDate } },
        include: { animal: { select: { name: true, identifier: true } } },
      }),
      this.prisma.stockMovement.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { article: { select: { name: true } } },
      }),
      this.prisma.workflowInstance.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
    ]);

    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalTTC?.toNumber() || 0), 0);
    const completedSales = sales.filter(s => s.status === 'COMPLETED').length;

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset='UTF-8'>
  <title>Rapport Mensuel — ${monthNames[month - 1]} ${year}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; }
    .header { background: linear-gradient(135deg, #1a5c38 0%, #2d7a4f 50%, #c4661a 100%); color: white; padding: 40px; }
    .header h1 { font-size: 28px; font-weight: 700; }
    .header p { font-size: 14px; opacity: 0.85; margin-top: 6px; }
    .logo { font-size: 36px; margin-bottom: 12px; }
    .content { padding: 32px; }
    .section { margin-bottom: 32px; }
    .section h2 { font-size: 18px; font-weight: 700; color: #1a5c38; border-bottom: 2px solid #1a5c38; padding-bottom: 8px; margin-bottom: 16px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card { background: #f8fdf9; border: 1px solid #d1e7d9; border-radius: 8px; padding: 16px; text-align: center; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #1a5c38; }
    .kpi-label { font-size: 12px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #1a5c38; color: white; padding: 10px 12px; text-align: left; }
    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 40px; padding: 20px 32px; background: #f3f4f6; font-size: 11px; color: #6b7280; text-align: center; }
    .page-break { page-break-after: always; }
    @media print { .page-break { page-break-after: always; } }
  </style>
</head>
<body>
  <div class='header'>
    <div class='logo'>🦜</div>
    <h1>Rapport Mensuel — ${monthNames[month - 1]} ${year}</h1>
    <p>La Ferme Tropicale de Guyane · Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>

  <div class='content'>
    <!-- KPIs -->
    <div class='section'>
      <h2>📊 Indicateurs clés du mois</h2>
      <div class="kpi-grid">
        <div class='kpi-card'>
          <div class='kpi-value'>${animals}</div>
          <div class='kpi-label'>Animaux vivants</div>
        </div>
        <div class='kpi-card'>
          <div class='kpi-value'>${totalRevenue.toFixed(0)} €</div>
          <div class="kpi-label">Chiffre d'affaires TTC</div>
        </div>
        <div class='kpi-card'>
          <div class='kpi-value'>${medicalVisits.length}</div>
          <div class='kpi-label'>Visites médicales</div>
        </div>
        <div class='kpi-card'>
          <div class='kpi-value'>${workflows.length}</div>
          <div class="kpi-label">Workflows créés</div>
        </div>
      </div>
    </div>

    <!-- Ventes -->
    <div class='section'>
      <h2>💰 Ventes du mois (${sales.length} transactions)</h2>
      ${sales.length > 0 ? `
      <table>
        <thead>
          <tr><th>Référence</th><th>Acheteur</th><th>Montant TTC</th><th>Statut</th><th>Date</th></tr>
        </thead>
        <tbody>
          ${sales.map(s => `
          <tr>
            <td><strong>${s.reference}</strong></td>
            <td>${s.buyerName}</td>
            <td><strong>${(s.totalTTC?.toNumber() || 0).toFixed(2)} €</strong></td>
            <td><span class="badge ${s.status === 'COMPLETED' ? 'badge-green' : s.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}">${s.status}</span></td>
            <td>${new Date(s.createdAt).toLocaleDateString('fr-FR')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <p style="margin-top:12px; font-weight:600; color:#1a5c38;">Total : ${totalRevenue.toFixed(2)} € TTC (${completedSales} ventes complétées)</p>
      ` : '<p style="color:#6b7280;">Aucune vente ce mois.</p>'}
    </div>

    <!-- Visites médicales -->
    <div class='section'>
      <h2>🩺 Visites médicales (${medicalVisits.length})</h2>
      ${medicalVisits.length > 0 ? `
      <table>
        <thead>
          <tr><th>Animal</th><th>ID</th><th>Type de visite</th><th>Date</th></tr>
        </thead>
        <tbody>
          ${medicalVisits.slice(0, 15).map(v => `
          <tr>
            <td>${v.animal?.name || 'N/A'}</td>
            <td>${v.animal?.identifier || 'N/A'}</td>
            <td>${v.visitType}</td>
            <td>${new Date(v.visitDate).toLocaleDateString('fr-FR')}</td>
          </tr>`).join('')}
          ${medicalVisits.length > 15 ? `<tr><td colspan="4" style="text-align:center;color:#6b7280;">... et ${medicalVisits.length - 15} autres visites</td></tr>` : ''}
        </tbody>
      </table>
      ` : '<p style="color:#6b7280;">Aucune visite médicale ce mois.</p>'}
    </div>

    <!-- Mouvements de stock -->
    <div class='section'>
      <h2>📦 Mouvements de stock (${stockMovements.length})</h2>
      ${stockMovements.length > 0 ? `
      <table>
        <thead>
          <tr><th>Article</th><th>Type</th><th>Quantité</th><th>Date</th></tr>
        </thead>
        <tbody>
          ${stockMovements.slice(0, 10).map(m => `
          <tr>
            <td>${m.article?.name || 'N/A'}</td>
            <td><span class="badge ${m.type === 'IN' ? 'badge-green' : 'badge-red'}">${m.type === 'IN' ? 'Entrée' : 'Sortie'}</span></td>
            <td>${m.quantity}</td>
            <td>${new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      ` : '<p style="color:#6b7280;">Aucun mouvement de stock ce mois.</p>'}
    </div>
  </div>

  <div class='footer'>
    <strong>LFTG Platform v5.0.0</strong> — La Ferme Tropicale de Guyane — Développé par William MERI<br>
    Rapport généré automatiquement le ${new Date().toLocaleString('fr-FR')} · Confidentiel
  </div>
</body>
</html>`;

    return Buffer.from(html, 'utf-8');
  }

  // ─── Dossier médical animal ───────────────────────────────────────────────
  async generateAnimalMedicalReport(animalId: string): Promise<Buffer> {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        species: true,
        enclosure: { select: { name: true, code: true } },
        medicalVisits: {
          orderBy: { visitDate: 'desc' },
          include: { treatments: true, vaccinations: true },
        },
        citesPermits: { where: { status: 'ACTIVE' } },
      },
    });

    if (!animal) throw new Error(`Animal ${animalId} introuvable`);

    const html = `<!DOCTYPE html>
<html lang='fr'>
<head>
  <meta charset='UTF-8'>
  <title>Dossier Médical — ${animal.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; }
    .header { background: linear-gradient(135deg, #1a5c38, #2d7a4f); color: white; padding: 32px; display: flex; align-items: center; gap: 20px; }
    .header-info h1 { font-size: 24px; }
    .header-info p { font-size: 13px; opacity: 0.8; margin-top: 4px; }
    .content { padding: 28px; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .info-card { background: #f8fdf9; border: 1px solid #d1e7d9; border-radius: 6px; padding: 12px; }
    .info-card label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
    .info-card value { display: block; font-weight: 600; font-size: 14px; margin-top: 2px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 16px; font-weight: 700; color: #1a5c38; border-bottom: 2px solid #1a5c38; padding-bottom: 6px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #1a5c38; color: white; padding: 8px 10px; text-align: left; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
    .footer { margin-top: 32px; padding: 16px; background: #f3f4f6; font-size: 10px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class='header'>
    <div style="font-size:48px;">🦜</div>
    <div class='header-info'>
      <h1>Dossier Médical — ${animal.name}</h1>
      <p>${animal.species?.commonName || ''} (${animal.species?.scientificName || ''}) · ID: ${animal.identifier}</p>
      <p>Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>

  <div class='content'>
    <div class='section'>
      <h2>📋 Informations générales</h2>
      <div class='info-grid'>
        <div class='info-card'><label>Nom</label><value>${animal.name}</value></div>
        <div class="info-card"><label>Identifiant</label><value>${animal.identifier}</value></div>
        <div class='info-card'><label>Statut</label><value>${animal.status}</value></div>
        <div class='info-card'><label>Espèce</label><value>${animal.species?.commonName || 'N/A'}</value></div>
        <div class='info-card'><label>Nom scientifique</label><value><em>${animal.species?.scientificName || 'N/A'}</em></value></div>
        <div class='info-card'><label>CITES</label><value>Annexe ${animal.species?.citesAppendix || 'Non listé'}</value></div>
        <div class='info-card'><label>Sexe</label><value>${animal.sex || 'Inconnu'}</value></div>
        <div class="info-card"><label>Date de naissance</label><value>${animal.birthDate ? new Date(animal.birthDate).toLocaleDateString('fr-FR') : 'Inconnue'}</value></div>
        <div class='info-card'><label>Enclos</label><value>${animal.enclosure?.name || 'Non assigné'} ${animal.enclosure?.code ? `(${animal.enclosure.code})` : ''}</value></div>
      </div>
    </div>

    <div class="section">
      <h2>🩺 Historique des visites médicales (${animal.medicalVisits.length})</h2>
      ${animal.medicalVisits.length > 0 ? `
      <table>
        <thead>
          <tr><th>Date</th><th>Type</th><th>Vétérinaire</th><th>Diagnostic</th><th>Traitements</th></tr>
        </thead>
        <tbody>
          ${animal.medicalVisits.map(v => `
          <tr>
            <td>${new Date(v.visitDate).toLocaleDateString('fr-FR')}</td>
            <td>${v.visitType}</td>
            <td>${v.veterinarian || 'N/A'}</td>
            <td>${v.diagnosis || 'RAS'}</td>
            <td>${v.treatments?.length || 0} traitement(s)</td>
          </tr>`).join('')}
        </tbody>
      </table>
      ` : '<p style="color:#6b7280;">Aucune visite médicale enregistrée.</p>'}
    </div>

    ${animal.citesPermits.length > 0 ? `
    <div class='section'>
      <h2>📜 Permis CITES actifs</h2>
      <table>
        <thead>
          <tr><th>N° Permis</th><th>Type</th><th>Valide jusqu'au</th><th>Délivré par</th></tr>
        </thead>
        <tbody>
          ${animal.citesPermits.map(p => `
          <tr>
            <td><strong>${p.permitNumber}</strong></td>
            <td>${p.permitType}</td>
            <td>${new Date(p.validUntil).toLocaleDateString('fr-FR')}</td>
            <td>${p.issuedBy || 'N/A'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${animal.notes ? `
    <div class="section">
      <h2>📝 Notes</h2>
      <p style="background:#f9fafb;padding:12px;border-radius:6px;font-size:13px;">${animal.notes}</p>
    </div>
    ` : ''}
  </div>

  <div class='footer'>
    <strong>LFTG Platform v5.0.0</strong> — La Ferme Tropicale de Guyane — Développé par William MERI<br>
    Document confidentiel — Usage interne uniquement
  </div>
</body>
</html>`;

    return Buffer.from(html, 'utf-8');
  }

  // ─── Rapport inventaire stock ─────────────────────────────────────────────
  async generateStockInventoryReport(): Promise<Buffer> {
    const articles = await this.prisma.stockArticle.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const critical = articles.filter(a => a.quantity <= a.minQuantity);
    const totalValue = articles.reduce((sum, a) => sum + (a.quantity * (a.unitPrice?.toNumber() || 0)), 0);

    const html = `<!DOCTYPE html>
<html lang='fr'>
<head>
  <meta charset='UTF-8'>
  <title>Inventaire Stock — ${new Date().toLocaleDateString('fr-FR')}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; }
    .header { background: linear-gradient(135deg, #c4661a, #e07b2a); color: white; padding: 32px; }
    .header h1 { font-size: 24px; }
    .content { padding: 28px; }
    .kpi-row { display: flex; gap: 16px; margin-bottom: 24px; }
    .kpi { flex: 1; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; text-align: center; }
    .kpi-value { font-size: 24px; font-weight: 700; color: #c4661a; }
    .kpi-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #c4661a; color: white; padding: 8px 10px; text-align: left; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
    .critical { background: #fee2e2 !important; }
    .footer { margin-top: 32px; padding: 16px; background: #f3f4f6; font-size: 10px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class='header'>
    <h1>📦 Inventaire du Stock</h1>
    <p>La Ferme Tropicale de Guyane · ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>
  <div class='content'>
    <div class="kpi-row">
      <div class='kpi'><div class='kpi-value'>${articles.length}</div><div class='kpi-label'>Articles total</div></div>
      <div class='kpi'><div class='kpi-value'>${critical.length}</div><div class="kpi-label">Articles critiques</div></div>
      <div class='kpi'><div class="kpi-value">${totalValue.toFixed(2)} €</div><div class='kpi-label'>Valeur totale du stock</div></div>
    </div>
    <table>
      <thead>
        <tr><th>Article</th><th>Référence</th><th>Catégorie</th><th>Quantité</th><th>Min.</th><th>Unité</th><th>Prix unit.</th><th>Valeur</th></tr>
      </thead>
      <tbody>
        ${articles.map(a => `
        <tr class="${a.quantity <= a.minQuantity ? 'critical' : ''}">
          <td><strong>${a.name}</strong></td>
          <td>${a.reference}</td>
          <td>${a.category}</td>
          <td><strong>${a.quantity}</strong></td>
          <td>${a.minQuantity}</td>
          <td>${a.unit}</td>
          <td>${a.unitPrice ? `${a.unitPrice.toFixed(2)} €` : 'N/A'}</td>
          <td>${a.unitPrice ? `${(a.quantity * a.unitPrice.toNumber()).toFixed(2)} €` : 'N/A'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  <div class="footer">LFTG Platform v5.0.0 — La Ferme Tropicale de Guyane — Développé par William MERI</div>
</body>
</html>`;

    return Buffer.from(html, 'utf-8');
  }
}
