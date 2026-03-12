'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ForecastPoint {
  month: string;
  value: number;
}

interface RevenueData {
  historical: ForecastPoint[];
  forecast: ForecastPoint[];
  trend?: number;
  nextMonth?: number;
}

interface PopulationData {
  historical: ForecastPoint[];
  forecast: ForecastPoint[];
  trend?: number;
}

interface StockAlert {
  article?: string;
  name?: string;
  current: number;
  unit?: string;
  daily?: number;
  daysLeft?: number;
  status: string;
}

interface VisitesForecast {
  forecast?: ForecastPoint[];
  nextMonth?: number;
  trend?: number;
}

export default function PrevisionsPage() {
  const { data: revenue, isLoading: loadingRevenue, isError, refetch } = useQuery<RevenueData>({
    queryKey: ['previsions-revenue'],
    queryFn: async () => {
      const res = await api.get('/previsions/revenue');
      return res.data;
    },
  });

  const { data: population, isLoading: loadingPop } = useQuery<PopulationData>({
    queryKey: ['previsions-population'],
    queryFn: async () => {
      const res = await api.get('/previsions/population');
      return res.data;
    },
  });

  const { data: stockAlerts = [], isLoading: loadingStock } = useQuery<StockAlert[]>({
    queryKey: ['previsions-stock'],
    queryFn: async () => {
      const res = await api.get('/previsions/stock');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: visites } = useQuery<VisitesForecast>({
    queryKey: ['previsions-visites'],
    queryFn: async () => {
      const res = await api.get('/previsions/visites');
      return res.data;
    },
  });

  const isLoading = loadingRevenue || loadingPop || loadingStock;

  const maxRevenue = Math.max(
    ...(revenue?.historical?.map((p) => p.value) || [0]),
    ...(revenue?.forecast?.map((p) => p.value) || [0]),
    1
  );

  const maxPop = Math.max(
    ...(population?.historical?.map((p) => p.value) || [0]),
    ...(population?.forecast?.map((p) => p.value) || [0]),
    1
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Prévisions & BI</h1>
        <p className="text-slate-400 mt-1">Projections financières, population et stock</p>
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
              { label: 'Revenus prévus (prochain mois)', value: revenue?.nextMonth ? `${revenue.nextMonth.toLocaleString('fr-FR')} €` : '—', color: 'text-indigo-400' },
              { label: 'Tendance revenus', value: revenue?.trend ? `${revenue.trend > 0 ? '+' : ''}${revenue.trend}%` : '—', color: revenue?.trend && revenue.trend > 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'Population prévue', value: population?.forecast?.[0]?.value || '—', color: 'text-blue-400' },
              { label: 'Visites prévues', value: visites?.nextMonth || '—', color: 'text-yellow-400' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-sm">{kpi.label}</p>
                <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Graphique revenus */}
          {revenue && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-white font-semibold mb-4">Prévisions de revenus</h2>
              <div className="flex items-end gap-1 h-40">
                {revenue.historical?.map((p) => (
                  <div key={`h-${p.month}`} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-indigo-600 rounded-t"
                      style={{ height: `${(p.value / maxRevenue) * 100}%` }}
                      title={`${p.month}: ${p.value.toLocaleString('fr-FR')} €`}
                    />
                    <span className="text-xs text-slate-400">{p.month}</span>
                  </div>
                ))}
                {revenue.forecast?.map((p) => (
                  <div key={`f-${p.month}`} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-indigo-400/50 rounded-t border border-indigo-400 border-dashed"
                      style={{ height: `${(p.value / maxRevenue) * 100}%` }}
                      title={`${p.month} (prévision): ${p.value.toLocaleString('fr-FR')} €`}
                    />
                    <span className="text-xs text-indigo-400">{p.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-600 rounded inline-block" /> Historique</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-400/50 border border-indigo-400 border-dashed rounded inline-block" /> Prévision</span>
              </div>
            </div>
          )}

          {/* Graphique population */}
          {population && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-white font-semibold mb-4">Évolution de la population animale</h2>
              <div className="flex items-end gap-1 h-32">
                {population.historical?.map((p) => (
                  <div key={`h-${p.month}`} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-green-600 rounded-t"
                      style={{ height: `${(p.value / maxPop) * 100}%` }}
                      title={`${p.month}: ${p.value} animaux`}
                    />
                    <span className="text-xs text-slate-400">{p.month}</span>
                  </div>
                ))}
                {population.forecast?.map((p) => (
                  <div key={`f-${p.month}`} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-green-400/50 rounded-t border border-green-400 border-dashed"
                      style={{ height: `${(p.value / maxPop) * 100}%` }}
                      title={`${p.month} (prévision): ${p.value} animaux`}
                    />
                    <span className="text-xs text-green-400">{p.month}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertes stock */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-white font-semibold mb-4">Prévisions de stock</h2>
            {stockAlerts.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Aucune alerte de stock prévue</p>
            ) : (
              <div className="space-y-3">
                {stockAlerts.map((alert, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${alert.status === 'CRITICAL' ? 'bg-red-900/20 border-red-700' : alert.status === 'WARNING' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-slate-700 border-slate-600'}`}>
                    <div>
                      <p className="text-white font-semibold">{alert.article || alert.name || '—'}</p>
                      <p className="text-slate-400 text-sm">Stock actuel : {alert.current} {alert.unit || ''}</p>
                    </div>
                    <div className="text-right">
                      {alert.daysLeft !== undefined && (
                        <p className={`font-semibold ${alert.status === 'CRITICAL' ? 'text-red-400' : alert.status === 'WARNING' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {alert.daysLeft} jours restants
                        </p>
                      )}
                      <p className="text-slate-400 text-xs">{alert.daily ? `${alert.daily} ${alert.unit || ''}/jour` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
