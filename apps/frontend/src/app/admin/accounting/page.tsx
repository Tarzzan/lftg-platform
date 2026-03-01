'use client';

import { useState } from 'react';

const JOURNAL_ENTRIES = [
  { id: 'je-1', date: '2026-02-28', journal: 'VT', piece: 'FAC-2026-089', account: '411000', label: 'Client Dupont - Vente Amazona', debit: 1200, credit: 0, balance: 1200 },
  { id: 'je-2', date: '2026-02-28', journal: 'VT', piece: 'FAC-2026-089', account: '707100', label: 'Vente animaux - Amazona', debit: 0, credit: 1000, balance: -1000 },
  { id: 'je-3', date: '2026-02-28', journal: 'VT', piece: 'FAC-2026-089', account: '445710', label: 'TVA collectée 20%', debit: 0, credit: 200, balance: -200 },
  { id: 'je-4', date: '2026-02-27', journal: 'AC', piece: 'BL-2026-045', account: '401000', label: 'Fournisseur Aliments Tropicaux', debit: 0, credit: 850, balance: -850 },
  { id: 'je-5', date: '2026-02-27', journal: 'AC', piece: 'BL-2026-045', account: '601100', label: 'Achats aliments animaux', debit: 708.33, credit: 0, balance: 708.33 },
  { id: 'je-6', date: '2026-02-27', journal: 'AC', piece: 'BL-2026-045', account: '445660', label: 'TVA déductible 20%', debit: 141.67, credit: 0, balance: 141.67 },
  { id: 'je-7', date: '2026-02-26', journal: 'BQ', piece: 'VIR-2026-012', account: '512000', label: 'Virement client reçu', debit: 2400, credit: 0, balance: 2400 },
  { id: 'je-8', date: '2026-02-26', journal: 'BQ', piece: 'VIR-2026-012', account: '411000', label: 'Règlement client', debit: 0, credit: 2400, balance: -2400 },
];

const ACCOUNT_SUMMARY = [
  { account: '411000', label: 'Clients', balance: 8450, type: 'ASSET' },
  { account: '401000', label: 'Fournisseurs', balance: -3200, type: 'LIABILITY' },
  { account: '512000', label: 'Banque', balance: 42150, type: 'ASSET' },
  { account: '707100', label: 'Ventes animaux', balance: -28750, type: 'REVENUE' },
  { account: '707200', label: 'Ventes formations', balance: -7200, type: 'REVENUE' },
  { account: '601100', label: 'Achats aliments', balance: 12400, type: 'EXPENSE' },
  { account: '641000', label: 'Salaires', balance: 18600, type: 'EXPENSE' },
  { account: '445710', label: 'TVA collectée', balance: -7190, type: 'LIABILITY' },
  { account: '445660', label: 'TVA déductible', balance: 3050, type: 'ASSET' },
];

const JOURNALS = [
  { code: 'VT', label: 'Ventes', entries: 45, total: 41250 },
  { code: 'AC', label: 'Achats', entries: 28, total: -18400 },
  { code: 'BQ', label: 'Banque', entries: 62, total: 22850 },
  { code: 'OD', label: 'Opérations diverses', entries: 12, total: 0 },
];

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'text-blue-700',
  LIABILITY: 'text-red-700',
  REVENUE: 'text-green-700',
  EXPENSE: 'text-amber-700',
};

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState('journal');
  const [journalFilter, setJournalFilter] = useState('ALL');
  const [exportPeriod, setExportPeriod] = useState('2026-02');

  const filteredEntries = journalFilter === 'ALL'
    ? JOURNAL_ENTRIES
    : JOURNAL_ENTRIES.filter(e => e.journal === journalFilter);

  const totalRevenue = ACCOUNT_SUMMARY.filter(a => a.type === 'REVENUE').reduce((s, a) => s + Math.abs(a.balance), 0);
  const totalExpenses = ACCOUNT_SUMMARY.filter(a => a.type === 'EXPENSE').reduce((s, a) => s + a.balance, 0);
  const netResult = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wood-900">Comptabilité & FEC</h1>
          <p className="text-sm text-wood-500 mt-1">Journal comptable, balance et export FEC (Fichier des Écritures Comptables)</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={exportPeriod}
            onChange={e => setExportPeriod(e.target.value)}
            className="px-3 py-2 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          <button className="btn-primary text-sm px-4 py-2">
            📥 Exporter FEC
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Chiffre d\'affaires', value: `${totalRevenue.toLocaleString('fr-FR')} €`, icon: '💰', color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Charges totales', value: `${totalExpenses.toLocaleString('fr-FR')} €`, icon: '📉', color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Résultat net', value: `${netResult.toLocaleString('fr-FR')} €`, icon: '📊', color: 'text-forest-700', bg: 'bg-forest-50' },
          { label: 'TVA à décaisser', value: `${(7190 - 3050).toLocaleString('fr-FR')} €`, icon: '🏛️', color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <div key={i} className={`${kpi.bg} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{kpi.icon}</span>
              <span className="text-xs text-wood-500">{kpi.label}</span>
            </div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-wood-100 rounded-xl p-1 w-fit">
        {[
          { id: 'journal', label: '📖 Journal' },
          { id: 'balance', label: '⚖️ Balance' },
          { id: 'journals', label: '📚 Journaux' },
          { id: 'export', label: '📥 Export FEC' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white text-forest-700 font-semibold shadow-sm' : 'text-wood-600 hover:text-wood-900'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'journal' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-wood-800">Journal des écritures — Février 2026</h2>
            <div className="flex gap-2">
              {['ALL', 'VT', 'AC', 'BQ', 'OD'].map(j => (
                <button
                  key={j}
                  onClick={() => setJournalFilter(j)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${journalFilter === j ? 'bg-forest-600 text-white' : 'bg-wood-100 text-wood-600 hover:bg-wood-200'}`}
                >
                  {j === 'ALL' ? 'Tous' : j}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-wood-200 bg-wood-50">
                  <th className="text-left py-2 px-3 text-wood-600 font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-wood-600 font-medium">Journal</th>
                  <th className="text-left py-2 px-3 text-wood-600 font-medium">Pièce</th>
                  <th className="text-left py-2 px-3 text-wood-600 font-medium">Compte</th>
                  <th className="text-left py-2 px-3 text-wood-600 font-medium">Libellé</th>
                  <th className="text-right py-2 px-3 text-wood-600 font-medium">Débit</th>
                  <th className="text-right py-2 px-3 text-wood-600 font-medium">Crédit</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(entry => (
                  <tr key={entry.id} className="border-b border-wood-100 hover:bg-wood-50">
                    <td className="py-2 px-3 text-wood-600">{entry.date}</td>
                    <td className="py-2 px-3">
                      <span className="bg-maroni-100 text-maroni-700 text-xs font-semibold px-2 py-0.5 rounded">
                        {entry.journal}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs font-mono text-wood-500">{entry.piece}</td>
                    <td className="py-2 px-3 font-mono text-sm text-wood-700">{entry.account}</td>
                    <td className="py-2 px-3 text-wood-700">{entry.label}</td>
                    <td className="py-2 px-3 text-right font-semibold text-blue-700">
                      {entry.debit > 0 ? `${entry.debit.toLocaleString('fr-FR')} €` : ''}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-red-600">
                      {entry.credit > 0 ? `${entry.credit.toLocaleString('fr-FR')} €` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-wood-300 bg-wood-50 font-bold">
                  <td colSpan={5} className="py-2 px-3 text-wood-700">TOTAL</td>
                  <td className="py-2 px-3 text-right text-blue-700">
                    {filteredEntries.reduce((s, e) => s + e.debit, 0).toLocaleString('fr-FR')} €
                  </td>
                  <td className="py-2 px-3 text-right text-red-600">
                    {filteredEntries.reduce((s, e) => s + e.credit, 0).toLocaleString('fr-FR')} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'balance' && (
        <div className="card p-6">
          <h2 className="font-semibold text-wood-800 mb-4">Balance générale — Février 2026</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wood-200 bg-wood-50">
                <th className="text-left py-2 px-3 text-wood-600 font-medium">Compte</th>
                <th className="text-left py-2 px-3 text-wood-600 font-medium">Libellé</th>
                <th className="text-left py-2 px-3 text-wood-600 font-medium">Type</th>
                <th className="text-right py-2 px-3 text-wood-600 font-medium">Solde</th>
              </tr>
            </thead>
            <tbody>
              {ACCOUNT_SUMMARY.map((acc, i) => (
                <tr key={i} className="border-b border-wood-100 hover:bg-wood-50">
                  <td className="py-2 px-3 font-mono text-wood-700">{acc.account}</td>
                  <td className="py-2 px-3 text-wood-700">{acc.label}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs font-semibold ${TYPE_COLORS[acc.type]}`}>
                      {acc.type === 'ASSET' ? 'Actif' : acc.type === 'LIABILITY' ? 'Passif' : acc.type === 'REVENUE' ? 'Produit' : 'Charge'}
                    </span>
                  </td>
                  <td className={`py-2 px-3 text-right font-semibold ${acc.balance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                    {Math.abs(acc.balance).toLocaleString('fr-FR')} €
                    {acc.balance < 0 ? ' Cr' : ' Dr'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'journals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JOURNALS.map((j, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-maroni-100 text-maroni-700 font-bold px-3 py-1 rounded-lg text-sm">{j.code}</span>
                  <h3 className="font-semibold text-wood-900">{j.label}</h3>
                </div>
                <span className="text-xs text-wood-500">{j.entries} écritures</span>
              </div>
              <p className={`text-xl font-bold ${j.total >= 0 ? 'text-forest-700' : 'text-red-600'}`}>
                {j.total >= 0 ? '+' : ''}{j.total.toLocaleString('fr-FR')} €
              </p>
              <div className="mt-3 h-1.5 bg-wood-100 rounded-full overflow-hidden">
                <div className="h-full bg-forest-500 rounded-full" style={{ width: `${Math.min(Math.abs(j.total) / 500, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'export' && (
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-wood-800 mb-2">Export FEC — Fichier des Écritures Comptables</h2>
            <p className="text-sm text-wood-500">Format conforme à l'article A47 A-1 du Livre des Procédures Fiscales (LPF). Fichier texte délimité par tabulations, encodage UTF-8.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">Exercice comptable</label>
              <select className="w-full px-3 py-2 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500">
                <option>2025-2026</option>
                <option>2024-2025</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">Période</label>
              <input type="month" defaultValue="2026-02" className="w-full px-3 py-2 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500" />
            </div>
          </div>

          <div className="bg-wood-50 rounded-xl p-4 font-mono text-xs text-wood-600 overflow-x-auto">
            <p className="text-wood-400 mb-2">// Aperçu du format FEC (premières lignes)</p>
            <p>JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|EcritureLet|DateLet|ValidDate|Montantdevise|Idevise</p>
            <p>VT|Ventes|VT2026001|20260228|411000|Clients|FAC-2026-089|20260228|Client Dupont - Vente Amazona|1200,00|0,00||||1200,00|EUR</p>
            <p>VT|Ventes|VT2026001|20260228|707100|Ventes animaux|FAC-2026-089|20260228|Vente animaux - Amazona|0,00|1000,00||||1000,00|EUR</p>
            <p>VT|Ventes|VT2026001|20260228|445710|TVA collectée|FAC-2026-089|20260228|TVA 20%|0,00|200,00||||200,00|EUR</p>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-forest-600 text-white rounded-xl hover:bg-forest-700 font-semibold">
              📥 Télécharger FEC (.txt)
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-wood-200 text-wood-700 rounded-xl hover:bg-wood-50 font-semibold">
              📊 Exporter en Excel
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Rappel légal :</strong> Le FEC doit être conservé pendant 6 ans et présenté à l'administration fiscale en cas de contrôle. Assurez-vous que les données sont complètes et cohérentes avant l'export.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
