'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'text-blue-700',
  LIABILITY: 'text-red-700',
  REVENUE: 'text-green-700',
  EXPENSE: 'text-amber-700',
};

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState('summary');
  const [exportPeriod, setExportPeriod] = useState('2026-02');
  const [exportYear] = useState(new Date().getFullYear());

  const { data: summary, isLoading } = useQuery({
    queryKey: ['accounting-summary', exportYear],
    queryFn: () => api.get(`/accounting/summary?year=${exportYear}`).then(r => r.data),
  });

  const handleExportFEC = async () => {
    const [year, month] = exportPeriod.split('-');
    try {
      const res = await api.get(`/accounting/fec?year=${year}&month=${month}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `FEC_LFTG_${year}${month}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erreur lors de l\'export FEC');
    }
  };

  const totalRevenue = summary?.totalRevenue || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const grossProfit = summary?.grossProfit || 0;
  const profitMargin = summary?.profitMargin || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wood-900">Comptabilité & FEC</h1>
          <p className="text-sm text-wood-500 mt-1">Résumé financier annuel et export FEC (Fichier des Écritures Comptables)</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={exportPeriod}
            onChange={e => setExportPeriod(e.target.value)}
            className="px-3 py-2 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          <button onClick={handleExportFEC} className="btn-primary text-sm px-4 py-2">
            📥 Exporter FEC
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600" />
          <span className="ml-3 text-wood-500">Chargement des données comptables...</span>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Chiffre d\'affaires', value: `${totalRevenue.toLocaleString('fr-FR')} €`, icon: '💰', color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Charges totales', value: `${totalExpenses.toLocaleString('fr-FR')} €`, icon: '📉', color: 'text-red-700', bg: 'bg-red-50' },
              { label: 'Résultat brut', value: `${grossProfit.toLocaleString('fr-FR')} €`, icon: '📊', color: 'text-forest-700', bg: 'bg-forest-50' },
              { label: 'Marge brute', value: `${profitMargin} %`, icon: '📈', color: 'text-amber-700', bg: 'bg-amber-50' },
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
              { id: 'summary', label: '📊 Résumé' },
              { id: 'monthly', label: '📅 Mensuel' },
              { id: 'categories', label: '🏷️ Catégories' },
              { id: 'export', label: '📥 Export FEC' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white dark:bg-gray-800 text-forest-700 font-semibold shadow-sm' : 'text-wood-600 hover:text-wood-900'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'summary' && (
            <div className="card p-6">
              <h2 className="font-semibold text-wood-800 mb-4">Résumé annuel {exportYear}</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-wood-100">
                  <span className="text-wood-600">Chiffre d'affaires total</span>
                  <span className="font-bold text-green-700">{totalRevenue.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-wood-100">
                  <span className="text-wood-600">Charges totales estimées</span>
                  <span className="font-bold text-red-600">{totalExpenses.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-wood-100">
                  <span className="text-wood-600 font-semibold">Résultat brut</span>
                  <span className={`font-bold text-lg ${grossProfit >= 0 ? 'text-forest-700' : 'text-red-700'}`}>
                    {grossProfit >= 0 ? '+' : ''}{grossProfit.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-wood-600">Marge brute</span>
                  <span className="font-bold text-amber-700">{profitMargin} %</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="card p-6">
              <h2 className="font-semibold text-wood-800 mb-4">Évolution mensuelle {exportYear}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-wood-200 bg-wood-50">
                      <th className="text-left py-2 px-3 text-wood-600 font-medium">Mois</th>
                      <th className="text-right py-2 px-3 text-wood-600 font-medium">CA (€)</th>
                      <th className="text-right py-2 px-3 text-wood-600 font-medium">Charges (€)</th>
                      <th className="text-right py-2 px-3 text-wood-600 font-medium">Résultat (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary?.byMonth || []).map((m: any) => {
                      const result = m.revenue - m.expenses;
                      return (
                        <tr key={m.month} className="border-b border-wood-100 hover:bg-wood-50">
                          <td className="py-2 px-3 text-wood-700">
                            {new Date(exportYear, m.month - 1, 1).toLocaleDateString('fr-FR', { month: 'long' })}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-green-700">
                            {m.revenue.toLocaleString('fr-FR')}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-red-600">
                            {m.expenses.toLocaleString('fr-FR')}
                          </td>
                          <td className={`py-2 px-3 text-right font-bold ${result >= 0 ? 'text-forest-700' : 'text-red-700'}`}>
                            {result >= 0 ? '+' : ''}{result.toLocaleString('fr-FR')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="card p-6">
              <h2 className="font-semibold text-wood-800 mb-4">Répartition par catégorie {exportYear}</h2>
              <div className="space-y-4">
                {(summary?.byCategory || []).map((cat: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-wood-700">{cat.category}</span>
                      <span className="text-sm font-bold text-forest-700">{cat.revenue.toLocaleString('fr-FR')} € ({cat.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-wood-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest-500 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="font-semibold text-wood-800 mb-2">Export FEC — Fichier des Écritures Comptables</h2>
                <p className="text-sm text-wood-500">Format conforme à l'article A47 A-1 du Livre des Procédures Fiscales (LPF). Fichier texte délimité par le caractère pipe (|), encodage UTF-8.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-1">Période à exporter</label>
                  <input
                    type="month"
                    value={exportPeriod}
                    onChange={e => setExportPeriod(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>
              </div>

              <div className="bg-wood-50 rounded-xl p-4 font-mono text-xs text-wood-600 overflow-x-auto">
                <p className="text-wood-400 mb-2">// Format FEC (aperçu)</p>
                <p>JournalCode|JournalLib|EcritureDate|CompteNum|CompteLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|...</p>
                <p>VTE|VENTES|20260115|411000|Clients|FAC-001|20260115|Vente animal|1200.00|0.00|...</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleExportFEC}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-forest-600 text-white rounded-xl hover:bg-forest-700 font-semibold"
                >
                  📥 Télécharger FEC (.txt)
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Rappel légal :</strong> Le FEC doit être conservé pendant 6 ans et présenté à l'administration fiscale en cas de contrôle. Assurez-vous que les données sont complètes avant l'export.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
