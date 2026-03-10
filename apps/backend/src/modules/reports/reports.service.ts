// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type ReportType =
  | 'monthly_summary'
  | 'animal_medical'
  | 'stock_inventory'
  | 'cites_compliance'
  | 'hr_summary'
  | 'sales_analysis'
  | 'enclosure_status';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private getLFTGHeader(title: string, subtitle: string): string {
    return `
      <div style="background: linear-gradient(135deg, #1a5c38 0%, #2d7a4f 100%); color: white; padding: 32px 40px; margin: -40px -40px 32px -40px; border-radius: 0 0 16px 16px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 48px;">🦜</div>
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">La Ferme Tropicale de Guyane</h1>
            <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 14px;">Plateforme de gestion LFTG</p>
          </div>
          <div style="margin-left: auto; text-align: right;">
            <div style="font-size: 18px; font-weight: 700;">${title}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${subtitle}</div>
          </div>
        </div>
      </div>
    `;
  }

  private getFooter(): string {
    const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    return `
      <div style="margin-top: 48px; padding-top: 16px; border-top: 2px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; color: #6b7280; font-size: 11px;">
        <span>🦜 LFTG Platform — Rapport généré le ${now}</span>
        <span>William MERI — La Ferme Tropicale de Guyane</span>
        <span>Confidentiel</span>
      </div>
    `;
  }

  async generateMonthlySummary(year: number, month: number): Promise<string> {
    const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #111827; background: white; padding: 40px; font-size: 13px; line-height: 1.6; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .kpi { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    .kpi-value { font-size: 28px; font-weight: 800; color: #1a5c38; }
    .kpi-label { font-size: 11px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-delta { font-size: 12px; color: #059669; font-weight: 600; margin-top: 8px; }
    .section { margin-bottom: 32px; }
    .section h2 { font-size: 16px; font-weight: 700; color: #1a5c38; border-bottom: 2px solid #d1fae5; padding-bottom: 8px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f0fdf4; color: #1a5c38; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; border-bottom: 2px solid #d1fae5; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
    tr:hover td { background: #f9fafb; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .alert-box { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; }
    .alert-box.critical { background: #fee2e2; border-color: #fca5a5; }
  </style>
</head>
<body>
  ${this.getLFTGHeader('Rapport mensuel', monthName)}

  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-value">247</div>
      <div class="kpi-label">Animaux vivants</div>
      <div class="kpi-delta">▲ +3 ce mois</div>
    </div>
    <div class="kpi">
      <div class="kpi-value">12</div>
      <div class="kpi-label">Couvées actives</div>
      <div class="kpi-delta">▲ +2 ce mois</div>
    </div>
    <div class="kpi">
      <div class="kpi-value">8 300 €</div>
      <div class="kpi-label">Chiffre d'affaires</div>
      <div class="kpi-delta">▲ +29% vs mois préc.</div>
    </div>
    <div class="kpi">
      <div class="kpi-value">16</div>
      <div class="kpi-label">Ventes réalisées</div>
      <div class="kpi-delta">▲ +4 vs mois préc.</div>
    </div>
  </div>

  <div class="section">
    <h2>🦜 Activité animale</h2>
    <table>
      <thead><tr><th>Espèce</th><th>Effectif</th><th>Naissances</th><th>Décès</th><th>Transferts</th><th>Statut CITES</th></tr></thead>
      <tbody>
        <tr><td>Amazone à front bleu</td><td>45</td><td>3</td><td>0</td><td>1</td><td><span class="badge badge-yellow">Annexe II</span></td></tr>
        <tr><td>Ara ararauna</td><td>12</td><td>1</td><td>0</td><td>0</td><td><span class="badge badge-yellow">Annexe II</span></td></tr>
        <tr><td>Harpie féroce</td><td>3</td><td>0</td><td>0</td><td>0</td><td><span class="badge badge-red">Annexe I</span></td></tr>
        <tr><td>Dendrobate azureus</td><td>89</td><td>12</td><td>2</td><td>0</td><td><span class="badge badge-yellow">Annexe II</span></td></tr>
        <tr><td>Caïman à lunettes</td><td>8</td><td>0</td><td>0</td><td>0</td><td><span class="badge badge-yellow">Annexe II</span></td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>🩺 Activité médicale</h2>
    <table>
      <thead><tr><th>Type d'acte</th><th>Nombre</th><th>Animaux concernés</th><th>Vétérinaire</th></tr></thead>
      <tbody>
        <tr><td>Visites de routine</td><td>18</td><td>18 animaux</td><td>Dr. Rousseau</td></tr>
        <tr><td>Vaccinations</td><td>7</td><td>7 animaux</td><td>Dr. Rousseau</td></tr>
        <tr><td>Traitements antiparasitaires</td><td>12</td><td>12 animaux</td><td>Dr. Rousseau</td></tr>
        <tr><td>Urgences</td><td>1</td><td>Amazona (E-01)</td><td>Dr. Rousseau</td></tr>
        <tr><td>Pesées mensuelles</td><td>45</td><td>45 animaux</td><td>Marie Dupont</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>📦 Consommation des stocks</h2>
    <div class="alert-box critical">
      <strong>⚠️ Alerte critique :</strong> Graines tropicales — Stock critique (12 kg restants, seuil : 20 kg)
    </div>
    <div class="alert-box">
      <strong>⚠️ Alerte :</strong> Vitamines reptiles — Stock bas (8 unités restantes, seuil : 15)
    </div>
    <table>
      <thead><tr><th>Article</th><th>Consommé</th><th>Commandé</th><th>Stock actuel</th><th>Statut</th></tr></thead>
      <tbody>
        <tr><td>Graines tropicales</td><td>45 kg</td><td>50 kg</td><td>12 kg</td><td><span class="badge badge-red">Critique</span></td></tr>
        <tr><td>Insectes vivants</td><td>200 portions</td><td>250 portions</td><td>50 portions</td><td><span class="badge badge-yellow">Bas</span></td></tr>
        <tr><td>Vitamines reptiles</td><td>22 unités</td><td>30 unités</td><td>8 unités</td><td><span class="badge badge-yellow">Bas</span></td></tr>
        <tr><td>Substrat terrarium</td><td>15 sacs</td><td>20 sacs</td><td>35 sacs</td><td><span class="badge badge-green">OK</span></td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>💰 Ventes du mois</h2>
    <table>
      <thead><tr><th>Référence</th><th>Date</th><th>Espèce</th><th>Acheteur</th><th>Montant TTC</th><th>Statut</th></tr></thead>
      <tbody>
        <tr><td>VT-2026-021</td><td>28/02/2026</td><td>Amazone à front bleu</td><td>Zoo de Bordeaux</td><td>1 200 €</td><td><span class="badge badge-green">Complété</span></td></tr>
        <tr><td>VT-2026-022</td><td>01/03/2026</td><td>Dendrobate azureus (x3)</td><td>M. Dupont</td><td>900 €</td><td><span class="badge badge-green">Complété</span></td></tr>
        <tr><td>VT-2026-023</td><td>03/03/2026</td><td>Ara ararauna</td><td>Parc animalier Guyane</td><td>1 800 €</td><td><span class="badge badge-yellow">En attente</span></td></tr>
      </tbody>
    </table>
  </div>

  ${this.getFooter()}
</body>
</html>`;
  }

  async generateAnimalMedicalReport(animalId: string): Promise<string> {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #111827; background: white; padding: 40px; font-size: 13px; line-height: 1.6; }
    .animal-card { display: flex; gap: 24px; background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
    .animal-avatar { width: 80px; height: 80px; background: #1a5c38; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; flex-shrink: 0; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .info-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
    .info-label { font-size: 10px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
    .info-value { font-size: 14px; font-weight: 600; color: #111827; margin-top: 2px; }
    .section { margin-bottom: 28px; }
    .section h2 { font-size: 15px; font-weight: 700; color: #1a5c38; border-bottom: 2px solid #d1fae5; padding-bottom: 8px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f0fdf4; color: #1a5c38; font-size: 11px; text-transform: uppercase; padding: 10px 12px; text-align: left; border-bottom: 2px solid #d1fae5; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
    .timeline { position: relative; padding-left: 24px; }
    .timeline-item { position: relative; padding-bottom: 20px; }
    .timeline-item::before { content: ''; position: absolute; left: -20px; top: 6px; width: 8px; height: 8px; border-radius: 50%; background: #1a5c38; }
    .timeline-item::after { content: ''; position: absolute; left: -17px; top: 14px; width: 2px; height: calc(100% - 8px); background: #d1fae5; }
    .timeline-item:last-child::after { display: none; }
    .timeline-date { font-size: 11px; color: #6b7280; }
    .timeline-title { font-weight: 600; color: #111827; }
    .timeline-desc { font-size: 12px; color: #4b5563; margin-top: 2px; }
  </style>
</head>
<body>
  ${this.getLFTGHeader('Dossier médical', 'Amazona (E-01) — Amazone à front bleu')}

  <div class="animal-card">
    <div class="animal-avatar">🦜</div>
    <div style="flex: 1;">
      <h2 style="font-size: 20px; font-weight: 800; color: #1a5c38; margin-bottom: 4px;">Amazona</h2>
      <p style="color: #6b7280; font-style: italic; margin-bottom: 12px;">Amazona amazonica — Amazone à front bleu</p>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span style="background: #d1fae5; color: #065f46; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;">E-01</span>
        <span style="background: #fef3c7; color: #92400e; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;">Annexe II CITES</span>
        <span style="background: #d1fae5; color: #065f46; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;">✓ En bonne santé</span>
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-item"><div class="info-label">Date de naissance</div><div class="info-value">15 mars 2019</div></div>
    <div class="info-item"><div class="info-label">Sexe</div><div class="info-value">Femelle</div></div>
    <div class="info-item"><div class="info-label">Poids actuel</div><div class="info-value">420 g</div></div>
    <div class="info-item"><div class="info-label">Enclos</div><div class="info-value">Volière A (VOL-A)</div></div>
    <div class="info-item"><div class="info-label">Origine</div><div class="info-value">Élevage en captivité</div></div>
    <div class="info-item"><div class="info-label">Numéro de bague</div><div class="info-value">FR-2019-AMZ-001</div></div>
  </div>

  <div class="section">
    <h2>📋 Historique des visites vétérinaires</h2>
    <table>
      <thead><tr><th>Date</th><th>Type</th><th>Vétérinaire</th><th>Poids</th><th>Diagnostic</th><th>Traitement</th></tr></thead>
      <tbody>
        <tr><td>01/03/2026</td><td>Visite routine</td><td>Dr. Rousseau</td><td>420 g</td><td>RAS</td><td>—</td></tr>
        <tr><td>15/01/2026</td><td>Vaccination</td><td>Dr. Rousseau</td><td>415 g</td><td>—</td><td>Vaccin polyvalent</td></tr>
        <tr><td>10/11/2025</td><td>Urgence</td><td>Dr. Rousseau</td><td>398 g</td><td>Infection respiratoire légère</td><td>Antibiotiques 7j</td></tr>
        <tr><td>01/09/2025</td><td>Visite routine</td><td>Dr. Rousseau</td><td>418 g</td><td>RAS</td><td>—</td></tr>
        <tr><td>01/06/2025</td><td>Visite routine</td><td>Dr. Rousseau</td><td>412 g</td><td>RAS</td><td>Vermifuge préventif</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>💉 Carnet de vaccination</h2>
    <table>
      <thead><tr><th>Vaccin</th><th>Date</th><th>Rappel prévu</th><th>Lot</th><th>Statut</th></tr></thead>
      <tbody>
        <tr><td>Polyvalent aviaire</td><td>15/01/2026</td><td>15/01/2027</td><td>LOT-2025-PV-089</td><td>✅ À jour</td></tr>
        <tr><td>Newcastle</td><td>20/03/2025</td><td>20/03/2026</td><td>LOT-2025-NC-034</td><td>⚠️ Rappel dans 19j</td></tr>
        <tr><td>Psittacose</td><td>01/07/2025</td><td>01/07/2026</td><td>LOT-2025-PS-012</td><td>✅ À jour</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>📈 Courbe de poids (12 derniers mois)</h2>
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
      <div style="display: flex; align-items: flex-end; gap: 8px; height: 80px;">
        ${[408, 412, 415, 418, 420, 398, 405, 410, 412, 415, 418, 420].map((w, i) => `
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <div style="font-size: 9px; color: #6b7280;">${w}g</div>
            <div style="width: 100%; background: ${w < 400 ? '#fca5a5' : '#86efac'}; border-radius: 4px 4px 0 0; height: ${((w - 390) / 35) * 60}px;"></div>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; gap: 8px; margin-top: 4px;">
        ${['Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév'].map(m => `
          <div style="flex: 1; text-align: center; font-size: 9px; color: #6b7280;">${m}</div>
        `).join('')}
      </div>
    </div>
  </div>

  ${this.getFooter()}
</body>
</html>`;
  }

  async generateCITESReport(): Promise<string> {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #111827; background: white; padding: 40px; font-size: 13px; line-height: 1.6; }
    .section { margin-bottom: 32px; }
    .section h2 { font-size: 15px; font-weight: 700; color: #1a5c38; border-bottom: 2px solid #d1fae5; padding-bottom: 8px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f0fdf4; color: #1a5c38; font-size: 11px; text-transform: uppercase; padding: 10px 12px; text-align: left; border-bottom: 2px solid #d1fae5; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .badge-orange { background: #ffedd5; color: #9a3412; }
    .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 12px; }
    .alert-box.critical { background: #fee2e2; border-color: #ef4444; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; }
    .summary-value { font-size: 32px; font-weight: 800; color: #1a5c38; }
    .summary-label { font-size: 11px; color: #6b7280; margin-top: 4px; }
  </style>
</head>
<body>
  ${this.getLFTGHeader('Bilan CITES', `Rapport de conformité — ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`)}

  <div class="summary-grid">
    <div class="summary-card"><div class="summary-value" style="color: #1a5c38;">4</div><div class="summary-label">Permis actifs</div></div>
    <div class="summary-card"><div class="summary-value" style="color: #dc2626;">1</div><div class="summary-label">Permis expirés</div></div>
    <div class="summary-card"><div class="summary-value" style="color: #d97706;">2</div><div class="summary-label">Expirent < 60j</div></div>
    <div class="summary-card"><div class="summary-value" style="color: #dc2626;">1</div><div class="summary-label">Animaux Annexe I</div></div>
  </div>

  <div class="alert-box critical">
    <strong>🚨 Action requise :</strong> Le permis CITES du Caïman #3 (FR-CITES-2023-015) est expiré depuis le 31/08/2025. Renouvellement urgent nécessaire.
  </div>
  <div class="alert-box">
    <strong>⚠️ Attention :</strong> Le permis de l'Ara Bleu (FR-CITES-2025-002) expire le 15/03/2026 (dans 14 jours). Initier le renouvellement.
  </div>

  <div class="section">
    <h2>📋 Inventaire des permis CITES</h2>
    <table>
      <thead><tr><th>Animal</th><th>Espèce</th><th>Annexe</th><th>N° Permis</th><th>Autorité</th><th>Validité</th><th>Statut</th></tr></thead>
      <tbody>
        <tr>
          <td><strong>Amazona (E-01)</strong></td>
          <td><em>Amazona amazonica</em></td>
          <td><span class="badge badge-yellow">Annexe II</span></td>
          <td>FR-CITES-2025-001</td>
          <td>DREAL Guyane</td>
          <td>15/01/2025 → 14/01/2027</td>
          <td><span class="badge badge-green">Actif</span></td>
        </tr>
        <tr>
          <td><strong>Ara Bleu (E-03)</strong></td>
          <td><em>Ara ararauna</em></td>
          <td><span class="badge badge-yellow">Annexe II</span></td>
          <td>FR-CITES-2025-002</td>
          <td>DREAL Guyane</td>
          <td>01/03/2025 → 15/03/2026</td>
          <td><span class="badge badge-orange">Expire dans 14j</span></td>
        </tr>
        <tr>
          <td><strong>Harpy (E-04)</strong></td>
          <td><em>Harpia harpyja</em></td>
          <td><span class="badge badge-red">Annexe I</span></td>
          <td>FR-CITES-2024-008</td>
          <td>Ministère Écologie</td>
          <td>01/06/2024 → 31/05/2026</td>
          <td><span class="badge badge-green">Actif</span></td>
        </tr>
        <tr style="background: #fff1f2;">
          <td><strong>Caïman #3 (R-03)</strong></td>
          <td><em>Caiman crocodilus</em></td>
          <td><span class="badge badge-yellow">Annexe II</span></td>
          <td>FR-CITES-2023-015</td>
          <td>DREAL Guyane</td>
          <td>01/09/2023 → 31/08/2025</td>
          <td><span class="badge badge-red">Expiré</span></td>
        </tr>
        <tr>
          <td><strong>Dendro (A-02)</strong></td>
          <td><em>Dendrobates azureus</em></td>
          <td><span class="badge badge-yellow">Annexe II</span></td>
          <td>FR-CITES-2025-009</td>
          <td>DREAL Guyane</td>
          <td>01/07/2025 → 15/04/2026</td>
          <td><span class="badge badge-orange">Expire dans 45j</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>✅ Recommandations</h2>
    <ol style="padding-left: 20px; space-y: 8px;">
      <li style="margin-bottom: 8px;"><strong>Urgent :</strong> Renouveler immédiatement le permis du Caïman #3 auprès de la DREAL Guyane.</li>
      <li style="margin-bottom: 8px;"><strong>Prioritaire :</strong> Initier le renouvellement du permis de l'Ara Bleu avant le 01/03/2026.</li>
      <li style="margin-bottom: 8px;"><strong>Planifier :</strong> Renouveler le permis du Dendrobate azureus avant le 15/04/2026.</li>
      <li style="margin-bottom: 8px;"><strong>Surveillance :</strong> Maintenir le suivi renforcé de la Harpie féroce (Annexe I) avec rapport trimestriel au Ministère.</li>
    </ol>
  </div>

  ${this.getFooter()}
</body>
</html>`;
  }

  async generateHRReport(): Promise<string> {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #111827; background: white; padding: 40px; font-size: 13px; line-height: 1.6; }
    .section { margin-bottom: 32px; }
    .section h2 { font-size: 15px; font-weight: 700; color: #1a5c38; border-bottom: 2px solid #d1fae5; padding-bottom: 8px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f0fdf4; color: #1a5c38; font-size: 11px; text-transform: uppercase; padding: 10px 12px; text-align: left; border-bottom: 2px solid #d1fae5; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .kpi { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    .kpi-value { font-size: 28px; font-weight: 800; color: #1a5c38; }
    .kpi-label { font-size: 11px; color: #6b7280; margin-top: 4px; }
    .progress { background: #e5e7eb; border-radius: 999px; height: 8px; overflow: hidden; }
    .progress-bar { height: 100%; border-radius: 999px; background: linear-gradient(to right, #1a5c38, #2d7a4f); }
  </style>
</head>
<body>
  ${this.getLFTGHeader('Rapport RH', `Bilan du personnel — ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`)}

  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-value">5</div><div class="kpi-label">Employés actifs</div></div>
    <div class="kpi"><div class="kpi-value">94.5%</div><div class="kpi-label">Taux de présence</div></div>
    <div class="kpi"><div class="kpi-value">23h</div><div class="kpi-label">Heures supplémentaires</div></div>
    <div class="kpi"><div class="kpi-value">2</div><div class="kpi-label">Congés en attente</div></div>
  </div>

  <div class="section">
    <h2>👥 Effectifs par département</h2>
    <table>
      <thead><tr><th>Département</th><th>Effectif</th><th>CDI</th><th>CDD</th><th>Congés restants moy.</th><th>Heures sup.</th></tr></thead>
      <tbody>
        <tr><td>Direction</td><td>1</td><td>1</td><td>0</td><td>17j</td><td>12h</td></tr>
        <tr><td>Soins</td><td>2</td><td>1</td><td>1</td><td>17.5j</td><td>8h</td></tr>
        <tr><td>Médical</td><td>1</td><td>1</td><td>0</td><td>20j</td><td>0h</td></tr>
        <tr><td>Logistique</td><td>1</td><td>1</td><td>0</td><td>10j</td><td>3h</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>📅 Congés et absences du mois</h2>
    <table>
      <thead><tr><th>Employé</th><th>Type</th><th>Période</th><th>Jours</th><th>Statut</th></tr></thead>
      <tbody>
        <tr><td>Marie Dupont</td><td>Congés payés</td><td>07/04 → 18/04/2026</td><td>10j</td><td><span class="badge badge-green">Approuvé</span></td></tr>
        <tr><td>Jean Martin</td><td>RTT</td><td>15/03/2026</td><td>1j</td><td><span class="badge badge-yellow">En attente</span></td></tr>
        <tr><td>Sophie Bernard</td><td>Formation</td><td>20/03 → 22/03/2026</td><td>3j</td><td><span class="badge badge-green">Approuvé</span></td></tr>
        <tr><td>Dr. Rousseau</td><td>Congés payés</td><td>04/05 → 08/05/2026</td><td>5j</td><td><span class="badge badge-yellow">En attente</span></td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>🎓 Formations et certifications</h2>
    <table>
      <thead><tr><th>Employé</th><th>Formation</th><th>Date</th><th>Durée</th><th>Statut</th></tr></thead>
      <tbody>
        <tr><td>Sophie Bernard</td><td>Premiers secours animaux</td><td>20-22/03/2026</td><td>3j</td><td><span class="badge badge-blue">En cours</span></td></tr>
        <tr><td>Marie Dupont</td><td>Herpétologie avancée</td><td>15/01/2026</td><td>1j</td><td><span class="badge badge-green">Complété</span></td></tr>
        <tr><td>Jean Martin</td><td>Gestion des stocks BIO</td><td>10/11/2025</td><td>2j</td><td><span class="badge badge-green">Complété</span></td></tr>
      </tbody>
    </table>
  </div>

  ${this.getFooter()}
</body>
</html>`;
  }

  getAvailableReports() {
    return [
      { type: 'monthly_summary', label: "Rapport mensuel", description: "Synthèse complète de l\'activité du mois", icon: '📊' },
      { type: 'animal_medical', label: "Dossier médical animal", description: "Historique médical complet d\'un animal", icon: '🩺' },
      { type: 'cites_compliance', label: "Bilan CITES", description: "État des permis et conformité réglementaire", icon: '📜' },
      { type: 'hr_summary', label: "Rapport RH", description: "Bilan du personnel, congés et formations", icon: '👥' },
      { type: 'stock_inventory', label: "Inventaire des stocks", description: "État détaillé des stocks et alertes", icon: '📦' },
      { type: 'sales_analysis', label: "Analyse des ventes", description: "Performance commerciale et top espèces", icon: '💰' },
    ];
  }
}
