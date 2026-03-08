'use client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface Site {
  id: string;
  name: string;
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
  type?: string;
  capacity?: number;
  manager?: string;
  openingHours?: string;
  description?: string;
  createdAt?: string;
}

export default function SitesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [form, setForm] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    type: 'PRINCIPAL',
    capacity: 0,
    manager: '',
    openingHours: '',
    description: '',
  });

  const { data: sites = [], isLoading } = useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: async () => {
      const res = await api.get('/sites');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await api.post('/sites', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setShowForm(false);
      setForm({ name: '', location: '', address: '', phone: '', email: '', type: 'PRINCIPAL', capacity: 0, manager: '', openingHours: '', description: '' });
    },
  });

  const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
    PRINCIPAL: { label: 'Site principal', icon: '🏛️', color: 'text-indigo-400' },
    ANNEXE: { label: 'Annexe', icon: '🏠', color: 'text-blue-400' },
    QUARANTAINE: { label: 'Quarantaine', icon: '🏥', color: 'text-red-400' },
    ELEVAGE: { label: 'Élevage', icon: '🌿', color: 'text-green-400' },
    STOCKAGE: { label: 'Stockage', icon: '📦', color: 'text-yellow-400' },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Sites</h1>
          <p className="text-slate-400 mt-1">{sites.length} site(s) enregistré(s)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Nouveau site
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-indigo-700">
          <h2 className="text-white font-semibold mb-4">Ajouter un site</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nom du site *" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500">
              {Object.entries(typeConfig).map(([t, cfg]) => (
                <option key={t} value={t}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>
            <input type="text" placeholder="Localisation (ville)" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500" />
            <input type="text" placeholder="Adresse complète" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500" />
            <input type="tel" placeholder="Téléphone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500" />
            <input type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500" />
            <input type="text" placeholder="Responsable" value={form.manager}
              onChange={(e) => setForm({ ...form, manager: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500" />
            <input type="number" placeholder="Capacité (animaux)" value={form.capacity || ''}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500" />
            <input type="text" placeholder="Horaires d'ouverture" value={form.openingHours}
              onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
              className="col-span-2 bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500" />
            <textarea placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="col-span-2 bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.name}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50">
              {createMutation.isPending ? 'Ajout...' : 'Ajouter'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Détail site */}
      {selectedSite && (
        <div className="bg-slate-800 rounded-xl p-6 border border-indigo-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">
              {typeConfig[selectedSite.type || 'PRINCIPAL']?.icon || '🏛️'} {selectedSite.name}
            </h2>
            <button onClick={() => setSelectedSite(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {selectedSite.location && <div><p className="text-slate-400">Localisation</p><p className="text-white">{selectedSite.location}</p></div>}
            {selectedSite.address && <div><p className="text-slate-400">Adresse</p><p className="text-white">{selectedSite.address}</p></div>}
            {selectedSite.phone && <div><p className="text-slate-400">Téléphone</p><p className="text-white">{selectedSite.phone}</p></div>}
            {selectedSite.email && <div><p className="text-slate-400">Email</p><p className="text-white">{selectedSite.email}</p></div>}
            {selectedSite.manager && <div><p className="text-slate-400">Responsable</p><p className="text-white">{selectedSite.manager}</p></div>}
            {selectedSite.capacity && <div><p className="text-slate-400">Capacité</p><p className="text-white">{selectedSite.capacity} animaux</p></div>}
            {selectedSite.openingHours && <div className="col-span-2"><p className="text-slate-400">Horaires</p><p className="text-white">{selectedSite.openingHours}</p></div>}
          </div>
          {selectedSite.description && <p className="text-slate-300 text-sm mt-3 italic">{selectedSite.description}</p>}
        </div>
      )}

      {/* Liste des sites */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : sites.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <p className="text-4xl mb-3">🏛️</p>
          <p className="text-slate-300 font-semibold">Aucun site enregistré</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => {
            const tCfg = typeConfig[site.type || 'PRINCIPAL'] || typeConfig.PRINCIPAL;
            return (
              <div key={site.id} onClick={() => setSelectedSite(site)}
                className="bg-slate-800 rounded-xl p-5 border border-slate-700 cursor-pointer hover:border-indigo-600 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{tCfg.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">{site.name}</h3>
                      <span className={`text-xs font-semibold ${tCfg.color}`}>{tCfg.label}</span>
                    </div>
                    {site.location && <p className="text-slate-400 text-sm mt-0.5">📍 {site.location}</p>}
                    {site.manager && <p className="text-slate-400 text-sm">👤 {site.manager}</p>}
                    {site.phone && <p className="text-slate-400 text-sm">📞 {site.phone}</p>}
                    {site.capacity && (
                      <p className="text-slate-400 text-sm">🐾 Capacité : {site.capacity} animaux</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
