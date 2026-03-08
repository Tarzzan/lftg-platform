'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface GeneticStats {
  totalAnimals: number;
  withGenealogy: number;
  breedingPairs: number;
  activeBreedings: number;
  avgConsanguinity: number;
  highRiskPairs: number;
  speciesStats: Array<{
    species: string;
    count: number;
    avgConsanguinity: number;
    diversity: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}

interface BreedingPair {
  id: string;
  male: { id: string; name: string; species: string };
  female: { id: string; name: string; species: string };
  compatibility: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR';
  consanguinityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: string;
  lastBrood?: string;
}

const compatibilityConfig = {
  EXCELLENT: { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700' },
  GOOD: { label: 'Bon', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-700' },
  ACCEPTABLE: { label: 'Acceptable', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700' },
  POOR: { label: 'Faible', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700' },
};

const riskConfig = {
  LOW: { label: 'Faible', color: 'text-green-400' },
  MEDIUM: { label: 'Moyen', color: 'text-yellow-400' },
  HIGH: { label: 'Élevé', color: 'text-red-400' },
};

const diversityConfig = {
  HIGH: { label: 'Haute', color: 'text-green-400' },
  MEDIUM: { label: 'Moyenne', color: 'text-yellow-400' },
  LOW: { label: 'Faible', color: 'text-red-400' },
};

export default function ElevagePage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'pairs'>('stats');

  const { data: stats, isLoading: loadingStats, isError: errorStats } = useQuery<GeneticStats>({
    queryKey: ['elevage-stats'],
    queryFn: async () => {
      const res = await api.get('/elevage/stats');
      return res.data;
    },
  });

  const { data: pairs = [], isLoading: loadingPairs } = useQuery<BreedingPair[]>({
    queryKey: ['elevage-pairs'],
    queryFn: async () => {
      const res = await api.get('/elevage/breeding-pairs');
      return res.data;
    },
    enabled: activeTab === 'pairs',
  });

  const isLoading = loadingStats || (activeTab === 'pairs' && loadingPairs);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Élevage & Génétique</h1>
        <p className="text-slate-400 mt-1">Gestion des reproductions et de la diversité génétique</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-slate-700 pb-0">
        {([['stats', 'Statistiques génétiques'], ['pairs', 'Couples reproducteurs']] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : errorStats ? (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 text-center text-red-400">
          Erreur lors du chargement des données d'élevage
        </div>
      ) : activeTab === 'stats' && stats ? (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Animaux total', value: stats.totalAnimals, color: 'text-slate-300' },
              { label: 'Avec généalogie', value: stats.withGenealogy, color: 'text-indigo-400' },
              { label: 'Couples actifs', value: stats.breedingPairs, color: 'text-blue-400' },
              { label: 'Reproductions', value: stats.activeBreedings, color: 'text-green-400' },
              { label: 'Consanguinité moy.', value: `${(stats.avgConsanguinity * 100).toFixed(1)}%`, color: 'text-yellow-400' },
              { label: 'Paires à risque', value: stats.highRiskPairs, color: 'text-red-400' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs">{kpi.label}</p>
                <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Stats par espèce */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-white font-semibold">Diversité génétique par espèce</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 text-sm font-medium p-4">Espèce</th>
                    <th className="text-center text-slate-400 text-sm font-medium p-4">Individus</th>
                    <th className="text-center text-slate-400 text-sm font-medium p-4">Consanguinité moy.</th>
                    <th className="text-center text-slate-400 text-sm font-medium p-4">Diversité</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.speciesStats.map((s, i) => (
                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 text-white font-medium">{s.species}</td>
                      <td className="p-4 text-center text-slate-300">{s.count}</td>
                      <td className="p-4 text-center">
                        <span className={`font-semibold ${s.avgConsanguinity > 0.05 ? 'text-red-400' : s.avgConsanguinity > 0.03 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {(s.avgConsanguinity * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-sm font-semibold ${diversityConfig[s.diversity]?.color || 'text-slate-400'}`}>
                          {diversityConfig[s.diversity]?.label || s.diversity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'pairs' ? (
        <div className="space-y-3">
          {pairs.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center">
              <p className="text-4xl mb-3">🐦</p>
              <p className="text-slate-300 font-semibold">Aucun couple reproducteur</p>
            </div>
          ) : (
            pairs.map((pair) => {
              const compat = compatibilityConfig[pair.compatibility] || compatibilityConfig.ACCEPTABLE;
              const risk = riskConfig[pair.consanguinityRisk] || riskConfig.MEDIUM;
              return (
                <div key={pair.id} className={`rounded-xl p-4 border ${compat.bg} ${compat.border}`}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-blue-400 font-semibold">{pair.male.name}</p>
                        <p className="text-slate-500 text-xs">♂ Mâle</p>
                      </div>
                      <span className="text-slate-400 text-lg">×</span>
                      <div className="text-center">
                        <p className="text-pink-400 font-semibold">{pair.female.name}</p>
                        <p className="text-slate-500 text-xs">♀ Femelle</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-slate-400 text-xs">Compatibilité</p>
                        <p className={`text-sm font-bold ${compat.color}`}>{compat.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-xs">Risque consanguinité</p>
                        <p className={`text-sm font-bold ${risk.color}`}>{risk.label}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">{pair.male.species}</p>
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
