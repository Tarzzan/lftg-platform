'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface VentesStats {
  total: number;
  completed: number;
  pending: number;
  revenue: number;
  byType: Array<{ type: string; count: number; revenue: number }>;
}

interface Vente {
  id: string;
  reference?: string;
  buyerName?: string;
  animalName?: string;
  amount: number;
  status: string;
  type?: string;
  createdAt?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  COMPLETED: { label: 'Complétée', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700' },
  PENDING: { label: 'En attente', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700' },
  CANCELLED: { label: 'Annulée', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700' },
  DRAFT: { label: 'Brouillon', color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' },
};

export default function VentesStatsPage() {
  const { data: stats, isLoading: loadingStats, isError }
  = useQuery<VentesStats>({
    queryKey: ['ventes-stats'],
    queryFn: async () => {
      const res = await api.get('/ventes/stats');
      return res.data;
    },
  });

  const { data: ventes = [], isLoading: loadingVentes } = useQuery<Vente[]>({
    queryKey: ['ventes'],
    queryFn: async () => {
      const res = await api.get('/ventes');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const isLoading = loadingStats || loadingVentes;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Statistiques des ventes</h1>
        <p className="text-slate-400 mt-1">Suivi des transactions et revenus</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total ventes', value: stats?.total ?? ventes.length, color: 'text-slate-300' },
              { label: 'Complétées', value: stats?.completed ?? ventes.filter((v) => v.status === 'COMPLETED').length, color: 'text-green-400' },
              { label: 'En attente', value: stats?.pending ?? ventes.filter((v) => v.status === 'PENDING').length, color: 'text-yellow-400' },
              { label: 'Revenus totaux', value: `${(stats?.revenue ?? ventes.reduce((s, v) => s + (v.amount || 0), 0)).toLocaleString('fr-FR')} €`, color: 'text-indigo-400' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-sm">{kpi.label}</p>
                <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Répartition par type */}
          {stats?.byType && stats.byType.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-white font-semibold mb-4">Répartition par type</h2>
              <div className="space-y-3">
                {stats.byType.map((t) => (
                  <div key={t.type} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm capitalize">{t.type}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 text-sm">{t.count} vente{t.count > 1 ? 's' : ''}</span>
                      <span className="text-indigo-400 font-semibold">{t.revenue.toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des ventes */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-white font-semibold">Historique des ventes</h2>
            </div>
            {ventes.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3"></p>
                <p className="text-slate-300 font-semibold">Aucune vente enregistrée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-slate-400 text-sm font-medium p-4">Référence</th>
                      <th className="text-left text-slate-400 text-sm font-medium p-4">Acheteur</th>
                      <th className="text-left text-slate-400 text-sm font-medium p-4">Animal</th>
                      <th className="text-center text-slate-400 text-sm font-medium p-4">Montant</th>
                      <th className="text-center text-slate-400 text-sm font-medium p-4">Statut</th>
                      <th className="text-center text-slate-400 text-sm font-medium p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventes.map((v) => {
                      const sCfg = statusConfig[v.status] || statusConfig.DRAFT;
                      return (
                        <tr key={v.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="p-4 text-slate-400 text-sm font-mono">{v.reference || v.id.slice(0, 8)}</td>
                          <td className="p-4 text-white">{v.buyerName || '—'}</td>
                          <td className="p-4 text-slate-300">{v.animalName || '—'}</td>
                          <td className="p-4 text-center text-indigo-400 font-semibold">{v.amount.toLocaleString('fr-FR')} €</td>
                          <td className="p-4 text-center">
                            <span className={`text-xs font-semibold px-2 py-1 rounded border ${sCfg.bg} ${sCfg.border} ${sCfg.color}`}>
                              {sCfg.label}
                            </span>
                          </td>
                          <td className="p-4 text-center text-slate-400 text-sm">
                            {v.createdAt ? new Date(v.createdAt).toLocaleDateString('fr-FR') : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
