'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Sponsorship {
  id: string;
  animalId: string;
  animalName: string;
  species?: string;
  sponsorName: string;
  sponsorEmail: string;
  sponsorPhone?: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one_time';
  startDate: string;
  nextPayment?: string;
  status: 'active' | 'paused' | 'cancelled';
  totalPaid?: number;
  notes?: string;
}

interface SponsorshipStats {
  total: number;
  active: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

const frequencyLabels: Record<string, string> = {
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  annual: 'Annuel',
  one_time: 'Unique',
};

const statusConfig = {
  active: { label: 'Actif', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700' },
  paused: { label: 'Suspendu', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700' },
  cancelled: { label: 'Annulé', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700' },
};

export default function ParrainagePage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: sponsorships = [], isLoading, isError } = useQuery<Sponsorship[]>({
    queryKey: ['parrainage'],
    queryFn: async () => {
      const res = await api.get('/parrainage');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: stats } = useQuery<SponsorshipStats>({
    queryKey: ['parrainage-stats'],
    queryFn: async () => {
      const res = await api.get('/parrainage/stats');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/parrainage/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['parrainage'] });
      queryClient.invalidateQueries({ queryKey: ['parrainage-stats'] });
    },
  });

  const filtered = sponsorships.filter((s) => {
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchSearch = !search || s.sponsorName.toLowerCase().includes(search.toLowerCase()) || s.animalName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalMonthly = sponsorships
    .filter((s) => s.status === 'active' && s.frequency === 'monthly')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Parrainage d'animaux</h1>
        <p className="text-slate-400 mt-1">Gestion des parrainages et des parrains</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total parrainages', value: sponsorships.length, color: 'text-slate-300' },
          { label: 'Actifs', value: sponsorships.filter((s) => s.status === 'active').length, color: 'text-green-400' },
          { label: 'Revenus mensuels', value: `${totalMonthly} €`, color: 'text-indigo-400' },
          { label: 'Total collecté', value: `${sponsorships.reduce((s, p) => s + (p.totalPaid || 0), 0)} €`, color: 'text-yellow-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un parrain ou animal..."
          className="flex-1 min-w-48 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
        />
        {(['all', 'active', 'paused', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {s === 'all' ? 'Tous' : s === 'active' ? 'Actifs' : s === 'paused' ? 'Suspendus' : 'Annulés'}
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : isError ? (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 text-center text-red-400">
          Erreur lors du chargement des parrainages
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🤝</p>
          <p className="text-slate-300 font-semibold">Aucun parrainage trouvé</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 text-sm font-medium p-4">Parrain</th>
                <th className="text-left text-slate-400 text-sm font-medium p-4">Animal</th>
                <th className="text-center text-slate-400 text-sm font-medium p-4">Montant</th>
                <th className="text-center text-slate-400 text-sm font-medium p-4">Fréquence</th>
                <th className="text-center text-slate-400 text-sm font-medium p-4">Total payé</th>
                <th className="text-center text-slate-400 text-sm font-medium p-4">Statut</th>
                <th className="text-center text-slate-400 text-sm font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sp) => {
                const sCfg = statusConfig[sp.status] || statusConfig.active;
                return (
                  <tr key={sp.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium">{sp.sponsorName}</p>
                      <p className="text-slate-500 text-xs">{sp.sponsorEmail}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{sp.animalName}</p>
                      {sp.species && <p className="text-slate-500 text-xs italic">{sp.species}</p>}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-indigo-400 font-semibold">{sp.amount} €</span>
                    </td>
                    <td className="p-4 text-center text-slate-300 text-sm">
                      {frequencyLabels[sp.frequency] || sp.frequency}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-yellow-400 font-semibold">{sp.totalPaid || 0} €</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-semibold px-2 py-1 rounded border ${sCfg.bg} ${sCfg.border} ${sCfg.color}`}>
                        {sCfg.label}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {sp.status === 'active' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: sp.id, status: 'paused' })}
                          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                        >
                          Suspendre
                        </button>
                      )}
                      {sp.status === 'paused' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: sp.id, status: 'active' })}
                          className="px-2 py-1 text-xs bg-green-800 hover:bg-green-700 text-green-300 rounded transition-colors"
                        >
                          Réactiver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
