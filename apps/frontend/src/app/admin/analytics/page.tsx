'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface BirthData { month: string; births: number; }
interface SpeciesData { speciesId: string; _count: { id: number }; name?: string; }

export default function AnalyticsPage() {
  const { data: births = [], isLoading: loadingBirths, isError: errorBirths } = useQuery<BirthData[]>({
    queryKey: ['analytics-births'],
    queryFn: async () => {
      const res = await api.get('/analytics/births');
      return res.data;
    },
  });

  const { data: species = [], isLoading: loadingSpecies } = useQuery<SpeciesData[]>({
    queryKey: ['analytics-species'],
    queryFn: async () => {
      const res = await api.get('/analytics/species');
      return res.data;
    },
  });

  const isLoading = loadingBirths || loadingSpecies;

  const maxBirths = Math.max(...births.map((b) => b.births), 1);
  const totalAnimals = species.reduce((sum, s) => sum + s._count.id, 0);

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Statistiques de naissance et distribution des espèces</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : errorBirths ? (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 text-center text-red-400">
          Erreur lors du chargement des données analytics
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Naissances par mois */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-white font-semibold mb-4">Naissances par mois</h2>
            {births.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aucune donnée disponible</p>
            ) : (
              <div className="space-y-3">
                {births.map((b) => (
                  <div key={b.month} className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm w-10 flex-shrink-0">{b.month}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${(b.births / maxBirths) * 100}%` }}
                      >
                        <span className="text-white text-xs font-bold">{b.births}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distribution des espèces */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-white font-semibold mb-4">
              Distribution des espèces
              <span className="text-slate-400 text-sm font-normal ml-2">({totalAnimals} animaux)</span>
            </h2>
            {species.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aucune donnée disponible</p>
            ) : (
              <div className="space-y-3">
                {species.slice(0, 10).map((s, i) => {
                  const pct = totalAnimals > 0 ? Math.round((s._count.id / totalAnimals) * 100) : 0;
                  const color = colors[i % colors.length];
                  return (
                    <div key={s.speciesId} className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-slate-400 text-sm flex-1 truncate">
                        {s.name || `Espèce #${i + 1}`}
                      </span>
                      <div className="w-32 bg-slate-700 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className="text-slate-300 text-sm font-semibold w-12 text-right">
                        {s._count.id} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Résumé */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Total naissances</p>
              <p className="text-3xl font-bold text-indigo-400 mt-1">
                {births.reduce((s, b) => s + b.births, 0)}
              </p>
              <p className="text-slate-500 text-xs mt-1">sur {births.length} mois</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Mois le plus actif</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {births.reduce((best, b) => b.births > best.births ? b : best, births[0] || { births: 0, month: '-' }).month}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {births.reduce((best, b) => b.births > best.births ? b : best, births[0] || { births: 0, month: '-' }).births} naissances
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Espèces distinctes</p>
              <p className="text-3xl font-bold text-purple-400 mt-1">{species.length}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Animaux recensés</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{totalAnimals}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
