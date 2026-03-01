import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  // ─── CSV helpers ─────────────────────────────────────────────────────────

  private toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
    const escape = (v: string | number | null | undefined) => {
      const s = v == null ? '' : String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const lines = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))];
    return lines.join('\n');
  }

  // ─── Stock ───────────────────────────────────────────────────────────────

  async exportStockCsv(): Promise<string> {
    const items = await this.prisma.stockItem.findMany({ orderBy: { name: 'asc' } });
    const headers = ['ID', 'Nom', 'Catégorie', 'Quantité', 'Unité', 'Seuil alerte', 'Statut'];
    const rows = items.map((i) => [
      i.id,
      i.name,
      i.category,
      i.quantity,
      i.unit,
      i.lowStockThreshold,
      i.quantity <= i.lowStockThreshold ? 'ALERTE' : 'OK',
    ]);
    return this.toCsv(headers, rows);
  }

  // ─── Animaux ─────────────────────────────────────────────────────────────

  async exportAnimauxCsv(): Promise<string> {
    const animals = await this.prisma.animal.findMany({
      include: { species: true, enclosure: true },
      orderBy: { name: 'asc' },
    });
    const headers = ['ID', 'Nom', 'Espèce', 'Sexe', 'Date naissance', 'Enclos', 'Statut'];
    const rows = animals.map((a) => [
      a.id,
      a.name,
      a.species?.name ?? '',
      a.sex ?? '',
      a.birthDate ? new Date(a.birthDate).toLocaleDateString('fr-FR') : '',
      a.enclosure?.name ?? '',
      a.status,
    ]);
    return this.toCsv(headers, rows);
  }

  // ─── Audit log ───────────────────────────────────────────────────────────

  async exportAuditCsv(limit = 1000): Promise<string> {
    const logs = await this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
    const headers = ['Date', 'Utilisateur', 'Email', 'Action', 'Entité', 'ID entité', 'IP'];
    const rows = logs.map((l) => [
      new Date(l.createdAt).toLocaleString('fr-FR'),
      l.user?.name ?? 'Système',
      l.user?.email ?? '',
      l.action,
      l.entityType,
      l.entityId ?? '',
      l.ipAddress ?? '',
    ]);
    return this.toCsv(headers, rows);
  }

  // ─── Personnel ───────────────────────────────────────────────────────────

  async exportPersonnelCsv(): Promise<string> {
    const employees = await this.prisma.employee.findMany({
      include: { user: { select: { name: true, email: true } }, skills: true },
      orderBy: { user: { name: 'asc' } },
    });
    const headers = ['ID', 'Nom', 'Email', 'Poste', 'Département', 'Date embauche', 'Statut', 'Compétences'];
    const rows = employees.map((e) => [
      e.id,
      e.user?.name ?? '',
      e.user?.email ?? '',
      e.position,
      e.department ?? '',
      e.hireDate ? new Date(e.hireDate).toLocaleDateString('fr-FR') : '',
      e.status,
      e.skills.map((s: any) => s.name).join('; '),
    ]);
    return this.toCsv(headers, rows);
  }

  // ─── Formation ───────────────────────────────────────────────────────────

  async exportFormationCsv(): Promise<string> {
    const enrollments = await this.prisma.enrollment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        cohort: { include: { course: { select: { title: true } } } },
      },
      orderBy: { enrolledAt: 'desc' },
    });
    const headers = ['Apprenant', 'Email', 'Formation', 'Cohorte', 'Date inscription', 'Progression', 'Statut'];
    const rows = enrollments.map((e) => [
      e.user?.name ?? '',
      e.user?.email ?? '',
      e.cohort?.course?.title ?? '',
      e.cohort?.name ?? '',
      new Date(e.enrolledAt).toLocaleDateString('fr-FR'),
      `${e.progress ?? 0}%`,
      e.status,
    ]);
    return this.toCsv(headers, rows);
  }

  // ─── HTML → PDF (simple) ─────────────────────────────────────────────────

  buildStockReportHtml(items: any[]): string {
    const rows = items.map((i) => `
      <tr class="${i.quantity <= i.lowStockThreshold ? 'alert' : ''}">
        <td>${i.name}</td>
        <td>${i.category}</td>
        <td>${i.quantity} ${i.unit}</td>
        <td>${i.lowStockThreshold} ${i.unit}</td>
        <td>${i.quantity <= i.lowStockThreshold ? '⚠ ALERTE' : '✓ OK'}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport Stock — LFTG</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; margin: 40px; }
  h1 { color: #16a34a; font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #6b7280; font-size: 11px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #16a34a; color: white; padding: 8px 12px; text-align: left; font-size: 11px; }
  td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; }
  tr.alert td { background: #fef3c7; }
  tr:hover td { background: #f0fdf4; }
  .footer { margin-top: 32px; font-size: 10px; color: #9ca3af; text-align: right; }
</style>
</head>
<body>
  <h1>🌿 Rapport d'inventaire — LFTG Platform</h1>
  <p class="subtitle">Généré le ${new Date().toLocaleString('fr-FR')} · ${items.length} article(s)</p>
  <table>
    <thead>
      <tr><th>Article</th><th>Catégorie</th><th>Quantité</th><th>Seuil alerte</th><th>Statut</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">La Ferme Tropicale de Guyane · LFTG Platform v2.0.0 · Signé: William MERI</div>
</body>
</html>`;
  }
}
