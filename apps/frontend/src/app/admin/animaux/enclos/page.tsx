'use client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface Enclos {
  id: string;
  name: string;
  type?: string;
  capacity?: number;
  currentOccupancy?: number;
  status?: string;
  location?: string;
  temperature?: number;
  humidity?: number;
  lastCleaned?: string;
  notes?: string;
  animals?: { id: string; name: string; species?: string }[];
}

interface EnclosStats {
  total: number;
  active: number;
  maintenance: number;
  totalAnimals: number;
  totalCapacity: number;
  globalOccupancy: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Actif', color: 'text-green-400', bg: 'bg-green-900/30' },
  MAINTENANCE: { label: 'Maintenance', color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  INACTIVE: { label: 'Inactif', color: 'text-red-400', bg: 'bg-red-900/30' },
};

const typeIcons: Record<string, string> = {
  TERRARIUM: '/icons/animal-lezard.png',
  VOLIERE: '/icons/animal-ara.png',
  AQUARIUM: '/icons/animal-tortue.png',
  ENCLOS_EXTERIEUR: '/icons/animal-pecari.png',
  BASSIN: '/icons/animal-caiman.png',
  QUARANTAINE: '/icons/section-medical.png',
};
function EnclosTypeIcon({ type }: { type?: string }) {
  const src = typeIcons[type || ''] || '/icons/animal-lezard.png';
  return (
    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-600 bg-slate-700 flex-shrink-0">
      <img src={src} alt={type || 'Enclos'} className="w-full h-full object-cover" />
    </div>
  );
}

export default function EnclosPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedEnclos, setSelectedEnclos] = useState<Enclos | null>(null);
  const [form, setForm] = useState({ name: '', type: 'TERRARIUM', capacity: 1, location: '', notes: '' });

  const { data: enclosList = [], isLoading, isError, error } = useQuery<Enclos[]>({
    queryKey: ['enclos'],
    queryFn: async () => {
      const res = await api.get('/enclos');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: stats } = useQuery<EnclosStats>({
    queryKey: ['enclos-stats'],
    queryFn: async () => {
      const res = await api.get('/enclos/stats');
      return res.data;
    },
  });

  const { data: enclosDetail } = useQuery<Enclos>({
    queryKey: ['enclos-detail', selectedEnclos?.id],
    queryFn: async () => {
      const res = await api.get(`/enclos/${selectedEnclos!.id}`);
      return res.data;
    },
    enabled: !!selectedEnclos?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await api.post('/enclos', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['enclos'] });
      queryClient.invalidateQueries({ queryKey: ['enclos-stats'] });
      setShowForm(false);
      setForm({ name: '', type: 'TERRARIUM', capacity: 1, location: '', notes: '' });
    },
  });

  const occupancyRate = (enc: Enclos) => {
    if (!enc.capacity || enc.capacity === 0) return 0;
    return Math.round(((enc.currentOccupancy || 0) / enc.capacity) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Enclos</h1>
          <p className="text-slate-400 mt-1">{enclosList.length} enclos enregistrés</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Nouvel enclos
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Total enclos</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Actifs</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{stats.active}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">En maintenance</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.maintenance}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Animaux hébergés</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{stats.totalAnimals}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Taux d'occupation</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.globalOccupancy}%</p>
          </div>
        </div>
      )}

      {/* Formulaire de création */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-indigo-700">
          <h2 className="text-white font-semibold mb-4">Créer un enclos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"placeholder="Nom de l'enclos *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            >
              {Object.keys(typeIcons).map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, '')}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Capacité maximale"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Localisation (ex: Serre A, Zone 3)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="col-span-2 bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.name}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Détail enclos sélectionné */}
      {selectedEnclos && enclosDetail && (
        <div className="bg-slate-800 rounded-xl p-6 border border-indigo-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">
              <div className="flex items-center gap-3">
                <EnclosTypeIcon type={enclosDetail.type} />
                <span>{enclosDetail.name}</span>
              </div>
            </h2>
            <button onClick={() =>setSelectedEnclos(null)} className="text-slate-400 hover:text-white text-xl"></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-slate-400 text-sm">Capacité</p>
              <p className="text-white font-semibold">{enclosDetail.capacity || 0} animaux max</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Occupation</p>
              <p className="text-white font-semibold">{enclosDetail.currentOccupancy || 0} / {enclosDetail.capacity || 0}</p>
            </div>
            {enclosDetail.temperature && (
              <div>
                <p className="text-slate-400 text-sm">Température</p>
                <p className="text-white font-semibold">{enclosDetail.temperature}°C</p>
              </div>
            )}
            {enclosDetail.humidity && (
              <div>
                <p className="text-slate-400 text-sm">Humidité</p>
                <p className="text-white font-semibold">{enclosDetail.humidity}%</p>
              </div>
            )}
          </div>
          {enclosDetail.animals && enclosDetail.animals.length > 0 && (
            <div>
              <p className="text-slate-400 text-sm mb-2">Animaux présents :</p>
              <div className="flex flex-wrap gap-2">
                {enclosDetail.animals.map((a) => (
                  <span key={a.id} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                    {a.name} {a.species ? `(${a.species})` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grille des enclos */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enclosList.map((enc) => {
            const rate = occupancyRate(enc);
            const sCfg = statusConfig[enc.status || 'ACTIVE'] || statusConfig.ACTIVE;
            return (
              <div
                key={enc.id}
                onClick={() => setSelectedEnclos(enc)}
                className="bg-slate-800 rounded-xl p-4 border border-slate-700 cursor-pointer hover:border-indigo-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <EnclosTypeIcon type={enc.type} />
                    <div>
                      <h3 className="text-white font-semibold">{enc.name}</h3>
                      {enc.location && <p className="text-slate-400 text-xs">{enc.location}</p>}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${sCfg.bg} ${sCfg.color}`}>
                    {sCfg.label}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Occupation</span>
                    <span className="text-white">{enc.currentOccupancy || 0} / {enc.capacity || 0}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${rate > 90 ? 'bg-red-500' : rate > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(rate, 100)}%` }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs text-right">{rate}% occupé</p>
                </div>
                {enc.temperature && (
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>️ {enc.temperature}°C</span>
                    {enc.humidity && <span>{enc.humidity}%</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
