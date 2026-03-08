'use client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface Partner {
  id: string;
  name: string;
  type?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
}

const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
  VETERINAIRE: { label: 'Vétérinaire', icon: '🏥', color: 'text-red-400' },
  FOURNISSEUR: { label: 'Fournisseur', icon: '🏭', color: 'text-blue-400' },
  ASSOCIATION: { label: 'Association', icon: '🤝', color: 'text-green-400' },
  INSTITUTION: { label: 'Institution', icon: '🏛️', color: 'text-purple-400' },
  MEDIA: { label: 'Média', icon: '📺', color: 'text-yellow-400' },
  AUTRE: { label: 'Autre', icon: '🔗', color: 'text-slate-400' },
};

const statusConfig: Record<string, { label: string; color: string; border: string }> = {
  ACTIVE: { label: 'Actif', color: 'text-green-400', border: 'border-green-700' },
  INACTIVE: { label: 'Inactif', color: 'text-slate-400', border: 'border-slate-600' },
  PENDING: { label: 'En attente', color: 'text-yellow-400', border: 'border-yellow-700' },
};

export default function PartnersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'FOURNISSEUR', email: '', phone: '', website: '', notes: '' });
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data: partners = [], isLoading, isError, error } = useQuery<Partner[]>({
    queryKey: ['partners'],
    queryFn: async () => {
      const res = await api.get('/partners');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await api.post('/partners', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setShowForm(false);
      setForm({ name: '', type: 'FOURNISSEUR', email: '', phone: '', website: '', notes: '' });
    },
  });

  const filtered = partners.filter((p) => {
    const matchType = filterType === 'ALL' || p.type === filterType;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Partenaires</h1>
          <p className="text-slate-400 mt-1">{partners.length} partenaire(s) enregistré(s)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Nouveau partenaire
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(typeConfig).slice(0, 4).map(([type, cfg]) => (
          <div key={type} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">{cfg.icon} {cfg.label}</p>
            <p className={`text-2xl font-bold mt-1 ${cfg.color}`}>{partners.filter((p) => p.type === type).length}</p>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-indigo-700">
          <h2 className="text-white font-semibold mb-4">Ajouter un partenaire</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nom du partenaire *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(typeConfig).map(([t, cfg]) => (
                <option key={t} value={t}>{cfg.label}</option>
              ))}
            </select>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="tel"
              placeholder="Téléphone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="url"
              placeholder="Site web"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.name}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Ajout...' : 'Ajouter'}
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

      {/* Filtres et recherche */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 w-48"
        />
        {['ALL', ...Object.keys(typeConfig)].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filterType === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {t === 'ALL' ? `Tous (${partners.length})` : `${typeConfig[t]?.icon} ${typeConfig[t]?.label} (${partners.filter((p) => p.type === t).length})`}
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <p className="text-4xl mb-3">🤝</p>
          <p className="text-slate-300 font-semibold">Aucun partenaire trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((partner) => {
            const tCfg = typeConfig[partner.type || 'AUTRE'] || typeConfig.AUTRE;
            const sCfg = statusConfig[partner.status || 'ACTIVE'] || statusConfig.ACTIVE;
            return (
              <div key={partner.id} className={`bg-slate-800 rounded-xl p-4 border ${sCfg.border}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{tCfg.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-semibold">{partner.name}</h3>
                        <span className={`text-xs font-semibold ${tCfg.color}`}>{tCfg.label}</span>
                        <span className={`text-xs font-semibold ${sCfg.color}`}>{sCfg.label}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-slate-400 text-sm flex-wrap">
                        {partner.email && <a href={`mailto:${partner.email}`} className="hover:text-indigo-400 transition-colors">✉️ {partner.email}</a>}
                        {partner.phone && <span>📞 {partner.phone}</span>}
                        {partner.website && (
                          <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                            🌐 Site web
                          </a>
                        )}
                      </div>
                      {partner.notes && <p className="text-slate-400 text-sm mt-1 italic">{partner.notes}</p>}
                    </div>
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
