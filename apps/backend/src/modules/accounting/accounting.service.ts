import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async generateFEC(year: number, month?: number) {
    // FEC = Fichier des Écritures Comptables (format DGFiP France)
    const entries = [
      { journalCode: 'VTE', journalLib: 'VENTES', ecritureDate: `${year}0115`, compteNum: '411000', compteLib: 'Clients', pieceRef: 'FAC-2026-001', pieceDate: `${year}0115`, ecritureLib: 'Vente Amazona amazonica', debit: '1200.00', credit: '0.00', ecritureLet: '', dateLet: '', validDate: `${year}0115`, montantDevise: '', iDevise: '' },
      { journalCode: 'VTE', journalLib: 'VENTES', ecritureDate: `${year}0115`, compteNum: '706000', compteLib: 'Prestations de services', pieceRef: 'FAC-2026-001', pieceDate: `${year}0115`, ecritureLib: 'Vente Amazona amazonica', debit: '0.00', credit: '1000.00', ecritureLet: '', dateLet: '', validDate: `${year}0115`, montantDevise: '', iDevise: '' },
      { journalCode: 'VTE', journalLib: 'VENTES', ecritureDate: `${year}0115`, compteNum: '445710', compteLib: 'TVA collectée', pieceRef: 'FAC-2026-001', pieceDate: `${year}0115`, ecritureLib: 'TVA 20%', debit: '0.00', credit: '200.00', ecritureLet: '', dateLet: '', validDate: `${year}0115`, montantDevise: '', iDevise: '' },
      { journalCode: 'ACH', journalLib: 'ACHATS', ecritureDate: `${year}0120`, compteNum: '401000', compteLib: 'Fournisseurs', pieceRef: 'FAC-FOUR-001', pieceDate: `${year}0120`, ecritureLib: 'Achat nourriture animaux', debit: '0.00', credit: '450.00', ecritureLet: '', dateLet: '', validDate: `${year}0120`, montantDevise: '', iDevise: '' },
      { journalCode: 'ACH', journalLib: 'ACHATS', ecritureDate: `${year}0120`, compteNum: '606100', compteLib: 'Fournitures non stockables', pieceRef: 'FAC-FOUR-001', pieceDate: `${year}0120`, ecritureLib: 'Achat nourriture animaux', debit: '375.00', credit: '0.00', ecritureLet: '', dateLet: '', validDate: `${year}0120`, montantDevise: '', iDevise: '' },
      { journalCode: 'ACH', journalLib: 'ACHATS', ecritureDate: `${year}0120`, compteNum: '445660', compteLib: 'TVA déductible', pieceRef: 'FAC-FOUR-001', pieceDate: `${year}0120`, ecritureLib: 'TVA 20%', debit: '75.00', credit: '0.00', ecritureLet: '', dateLet: '', validDate: `${year}0120`, montantDevise: '', iDevise: '' },
    ];

    const headers = ['JournalCode', 'JournalLib', 'EcritureDate', 'CompteNum', 'CompteLib', 'PieceRef', 'PieceDate', 'EcritureLib', 'Debit', 'Credit', 'EcritureLet', 'DateLet', 'ValidDate', 'MontantDevise', 'IDevise'];
    const rows = entries.map(e => Object.values(e).join('|'));
    const fecContent = [headers.join('|'), ...rows].join('\n');

    return {
      content: fecContent,
      filename: `FEC_LFTG_${year}${month ? String(month).padStart(2, '0') : ''}.txt`,
      entries: entries.length,
      period: { year, month },
      generatedAt: new Date().toISOString(),
    };
  }

  async getAccountingSummary(year: number) {
    return {
      year,
      totalRevenue: 412500,
      totalExpenses: 248000,
      grossProfit: 164500,
      profitMargin: 39.9,
      byMonth: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        revenue: Math.round(28000 + Math.random() * 15000),
        expenses: Math.round(17000 + Math.random() * 8000),
      })),
      byCategory: [
        { category: 'Ventes animaux', revenue: 287500, percentage: 69.7 },
        { category: 'Formations', revenue: 72000, percentage: 17.5 },
        { category: 'Consultations', revenue: 38000, percentage: 9.2 },
        { category: 'Autres', revenue: 15000, percentage: 3.6 },
      ],
    };
  }
}
