'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface BIDashboard {
  revenue?: { current: number; previous: number; trend: number };
  animals?: { total: number; bySpecies?: { name: string; count: number }[] };
  sales?: { total: number; count: number; avgTicket: number };
  medical?: { visitsThisMonth: number; pendingTreatments: number };
  stock?: { lowStockItems: number; totalValue: number };
  personnel?: { activeCount: number; hoursThisMonth: number };
}

interface BIForecast {
  revenue?: { months: string[]; values: number[] };
  population?: { months: string[]; values: number[] };
}

interface HealthTrend {
  month: string;
  healthy: number;
  sick: number;
  treated: number;
}

export default function BIDashboardPage() {
  const { data: dashboard, isLoading, isError, refetch: loadingDash } = useQuery<BIDashboard>({
    queryKey: ['bi-dashboard'],
    queryFn: async () => {
      const res = await api.get('/bi/dashboard');
      return res.data;
    },
  });

  const { data: forecast } = useQuery<BIForecast>({
    queryKey: ['bi-forecast'],
    queryFn: async () => {
      const res = await api.get('/bi/forecast');
      return res.data;
    },
  });

  const { data: healthTrend = [] } = useQuery<HealthTrend[]>({
    queryKey: ['bi-health-trend'],
    queryFn: async () => {
      const res = await api.get('/bi/animal-health-trend');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const isLoading = loadingDash;

  const formatCurrency = (v?: number) => v !== undefined ? `${v.toLocaleString('fr-FR')} €` : '—';
  const formatTrend = (v?: number) => v !== undefined ? `${v > 0 ? '+' : ''}${v}%` : '—';

  const maxForecastRevenue = Math.max(...(forecast?.revenue?.values || [1]));
  const maxHealthValue = Math.max(...healthTrend.map((h) => h.healthy + h.sick + h.treated), 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Business Intelligence</h1>
        <p className="text-slate-400 mt-1">Tableau de bord analytique et prévisions</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <>
          {/* KPIs principaux */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Revenus du mois</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{formatCurrency(dashboard?.revenue?.current)}</p>
              <p className={`text-sm mt-1 ${(dashboard?.revenue?.trend || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatTrend(dashboard?.revenue?.trend)} vs mois précédent
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Ventes totales</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(dashboard?.sales?.total)}</p>
              <p className="text-slate-400 text-sm mt-1">{dashboard?.sales?.count || 0} transactions</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Panier moyen</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{formatCurrency(dashboard?.sales?.avgTicket)}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Population animale</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{dashboard?.animals?.total || '—'}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Articles en rupture</p>
              <p className={`text-2xl font-bold mt-1 ${(dashboard?.stock?.lowStockItems || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {dashboard?.stock?.lowStockItems ?? '—'}
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Traitements en cours</p>
              <p className={`text-2xl font-bold mt-1 ${(dashboard?.medical?.pendingTreatments || 0) > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                {dashboard?.medical?.pendingTreatments ?? '—'}
              </p>
            </div>
          </div>

          {/* Répartition par espèce */}
          {dashboard?.animals?.bySpecies && dashboard.animals.bySpecies.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-white font-semibold mb-4">🦜 Répartition par espèce</h2>
              <div className="space-y-3">
                {dashboard.animals.bySpecies.slice(0, 8).map((s) => {
                  const pct = Math.round((s.count / (dashboard.animals?.total || 1)) * 100);
                  return (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-slate-300 text-sm w-40 truncate">{s.name}</span>
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-slate-400 text-sm w-16 text-right">{s.count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prévisions de revenus */}
          {forecast?.revenue && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-white font-semibold mb-4">📈 Prévisions de revenus (6 mois)</h2>
              <div className="flex items-end gap-2 h-32">
                {forecast.revenue.months?.map((month, i) => {
                  const value = forecast.revenue?.values?.[i] || 0;
                  const height = Math.round((value / maxForecastRevenue) * 100);
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-indigo-500/60 border border-indigo-400 border-dashed rounded-t"
                        style={{ height: `${height}%` }}
                        title={`${month}: ${value.toLocaleString('fr-FR')} €`}
                      />
                      <span className="text-xs text-indigo-400">{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tendance santé animale */}
          {healthTrend.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-white font-semibold mb-4">🏥 Tendance santé animale</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-slate-400 text-sm p-3">Mois</th>
                      <th className="text-center text-slate-400 text-sm p-3">Sains</th>
                      <th className="text-center text-slate-400 text-sm p-3">Malades</th>
                      <th className="text-center text-slate-400 text-sm p-3">En traitement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthTrend.map((h) => (
                      <tr key={h.month} className="border-b border-slate-700/50">
                        <td className="p-3 text-slate-300">{h.month}</td>
                        <td className="p-3 text-center text-green-400 font-semibold">{h.healthy}</td>
                        <td className="p-3 text-center text-red-400 font-semibold">{h.sick}</td>
                        <td className="p-3 text-center text-yellow-400 font-semibold">{h.treated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
