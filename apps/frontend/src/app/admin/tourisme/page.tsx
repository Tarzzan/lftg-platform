'use client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface Visite {
  id: string;
  title: string;
  date: string;
  time?: string;
  duration?: number;
  guide?: string;
  max?: number;
  current?: number;
  price?: number;
  status: string;
  type?: string;
  zones?: string[];
}

interface Reservation {
  id: string;
  visitTitle?: string;
  date?: string;
  client?: string;
  email?: string;
  participants?: number;
  total?: number;
  status: string;
  payment?: string;
}

interface TourismeStats {
  totalVisites?: number;
  totalReservations?: number;
  totalRevenue?: number;
  avgOccupancy?: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  CONFIRMED: { label: 'Confirmé', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700' },
  PENDING: { label: 'En attente', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700' },
  CANCELLED: { label: 'Annulé', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700' },
  COMPLETED: { label: 'Terminé', color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-600' },
};

const typeIcons: Record<string, string> = { GUIDED: '', SCHOOL: '', PRIVATE: '‍‍', SPECIAL: '⭐', GROUP: '' };

export default function TourismePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'visites' | 'reservations' | 'stats'>('visites');
  const [showNewVisiteForm, setShowNewVisiteForm] = useState(false);
  const [newVisite, setNewVisite] = useState({ title: '', date: '', time: '', guide: '', max: 10, price: 0, type: 'GUIDED' });

  const { data: visites = [], isLoading, isError, refetch: loadingVisites } = useQuery<Visite[]>({
    queryKey: ['tourisme-visites'],
    queryFn: async () => {
      const res = await api.get('/tourisme/visites');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: reservations = [], isLoading: loadingReservations } = useQuery<Reservation[]>({
    queryKey: ['tourisme-reservations'],
    queryFn: async () => {
      const res = await api.get('/tourisme/reservations');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: stats } = useQuery<TourismeStats>({
    queryKey: ['tourisme-stats'],
    queryFn: async () => {
      const res = await api.get('/tourisme/stats');
      return res.data;
    },
  });

  const createVisiteMutation = useMutation({
    mutationFn: async (data: typeof newVisite) => {
      const res = await api.post('/tourisme/visites', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['tourisme-visites'] });
      setShowNewVisiteForm(false);
      setNewVisite({ title: '', date: '', time: '', guide: '', max: 10, price: 0, type: 'GUIDED' });
    },
  });

  const totalRevenue = reservations.reduce((s, r) => s + (r.total || 0), 0);
  const confirmedReservations = reservations.filter((r) => r.status === 'CONFIRMED').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tourisme & Visites</h1>
          <p className="text-slate-400 mt-1">Gestion des visites guidées et réservations</p>
        </div>
        <button
          onClick={() => setShowNewVisiteForm(!showNewVisiteForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Nouvelle visite
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Visites programmées', value: visites.length, color: 'text-indigo-400' },
          { label: 'Réservations confirmées', value: confirmedReservations, color: 'text-green-400' },
          { label: 'Revenus totaux', value: `${totalRevenue.toLocaleString('fr-FR')} €`, color: 'text-yellow-400' },
          { label: 'Taux occupation moyen', value: stats?.avgOccupancy ? `${stats.avgOccupancy}%` : `${visites.length > 0 ? Math.round(visites.reduce((s, v) => s + ((v.current || 0) / (v.max || 1)) * 100, 0) / visites.length) : 0}%`, color: 'text-blue-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Formulaire nouvelle visite */}
      {showNewVisiteForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-indigo-700">
          <h2 className="text-white font-semibold mb-4">Créer une nouvelle visite</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Titre de la visite"
              value={newVisite.title}
              onChange={(e) => setNewVisite({ ...newVisite, title: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="date"
              value={newVisite.date}
              onChange={(e) => setNewVisite({ ...newVisite, date: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="time"
              value={newVisite.time}
              onChange={(e) => setNewVisite({ ...newVisite, time: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Guide"
              value={newVisite.guide}
              onChange={(e) => setNewVisite({ ...newVisite, guide: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="Capacité max"
              value={newVisite.max}
              onChange={(e) => setNewVisite({ ...newVisite, max: parseInt(e.target.value) })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="Prix (€)"
              value={newVisite.price}
              onChange={(e) => setNewVisite({ ...newVisite, price: parseFloat(e.target.value) })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createVisiteMutation.mutate(newVisite)}
              disabled={createVisiteMutation.isPending || !newVisite.title || !newVisite.date}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {createVisiteMutation.isPending ? 'Création...' : 'Créer la visite'}
            </button>
            <button
              onClick={() => setShowNewVisiteForm(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-2">
        {(['visites', 'reservations'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {tab === 'visites' ? `Visites (${visites.length})` : `Réservations (${reservations.length})`}
          </button>
        ))}
      </div>

      {/* Liste des visites */}
      {activeTab === 'visites' && (
        <div className="space-y-3">
          {loadingVisites ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : visites.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
              <p className="text-4xl mb-3">️</p>
              <p className="text-slate-300 font-semibold">Aucune visite programmée</p>
            </div>
          ) : (
            visites.map((visite) => {
              const sCfg = statusConfig[visite.status] || statusConfig.PENDING;
              const occupancy = visite.max ? Math.round(((visite.current || 0) / visite.max) * 100) : 0;
              return (
                <div key={visite.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{typeIcons[visite.type || ''] || ''}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold">{visite.title}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${sCfg.bg} ${sCfg.border} ${sCfg.color}`}>
                            {sCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-slate-400 text-sm flex-wrap">
                          <span>{new Date(visite.date).toLocaleDateString('fr-FR')}</span>
                          {visite.time && <span>{visite.time}</span>}
                          {visite.guide && <span>{visite.guide}</span>}
                          {visite.duration && <span>⏱ {visite.duration} min</span>}
                          {visite.price !== undefined && <span>{visite.price} €/pers</span>}
                        </div>
                        {visite.max && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span>Occupation : {visite.current || 0}/{visite.max}</span>
                              <span>{occupancy}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${occupancy >= 90 ? 'bg-red-500' : occupancy >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${occupancy}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {visite.zones && visite.zones.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {visite.zones.map((z) => (
                              <span key={z} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{z}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Liste des réservations */}
      {activeTab === 'reservations' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {loadingReservations ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : reservations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3"></p>
              <p className="text-slate-300 font-semibold">Aucune réservation</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 text-sm font-medium p-4">Client</th>
                    <th className="text-left text-slate-400 text-sm font-medium p-4">Visite</th>
                    <th className="text-center text-slate-400 text-sm font-medium p-4">Participants</th>
                    <th className="text-center text-slate-400 text-sm font-medium p-4">Total</th>
                    <th className="text-center text-slate-400 text-sm font-medium p-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => {
                    const sCfg = statusConfig[r.status] || statusConfig.PENDING;
                    return (
                      <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <p className="text-white">{r.client || '—'}</p>
                          <p className="text-slate-400 text-xs">{r.email || ''}</p>
                        </td>
                        <td className="p-4 text-slate-300">{r.visitTitle || '—'}</td>
                        <td className="p-4 text-center text-slate-300">{r.participants || '—'}</td>
                        <td className="p-4 text-center text-indigo-400 font-semibold">{r.total ? `${r.total} €` : '—'}</td>
                        <td className="p-4 text-center">
                          <span className={`text-xs font-semibold px-2 py-1 rounded border ${sCfg.bg} ${sCfg.border} ${sCfg.color}`}>
                            {sCfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
