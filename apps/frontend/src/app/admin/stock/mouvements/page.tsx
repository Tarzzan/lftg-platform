'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  reason?: string;
  createdAt: string;
  item?: { id: string; name: string; unit?: string };
  itemId?: string;
}

interface StockItem {
  id: string;
  name: string;
  unit?: string;
}

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  IN: { label: 'Entrée', color: 'text-green-400', icon: '↑' },
  OUT: { label: 'Sortie', color: 'text-red-400', icon: '↓' },
  ADJUSTMENT: { label: 'Ajustement', color: 'text-yellow-400', icon: '⇄' },
  TRANSFER: { label: 'Transfert', color: 'text-blue-400', icon: '→' },
};

export default function StockMouvementsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ itemId: '', type: 'IN', quantity: 1, reason: '' });
  const [filterType, setFilterType] = useState('ALL');

  const { data: movements = [], isLoading } = useQuery<StockMovement[]>({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const res = await api.get('/plugins/stock/movements');
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 30000,
  });

  const { data: items = [] } = useQuery<StockItem[]>({
    queryKey: ['stock-items-list'],
    queryFn: async () => {
      const res = await api.get('/plugins/stock/items');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await api.post('/plugins/stock/movements', { ...data, quantity: Number(data.quantity) });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-items-list'] });
      setShowForm(false);
      setForm({ itemId: '', type: 'IN', quantity: 1, reason: '' });
    },
  });

  const filtered = filterType === 'ALL' ? movements : movements.filter((m) => m.type === filterType);

  const totalIn = movements.filter((m) => m.type === 'IN').reduce((s, m) => s + m.quantity, 0);
  const totalOut = movements.filter((m) => m.type === 'OUT').reduce((s, m) => s + m.quantity, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mouvements de stock</h1>
          <p className="text-slate-400 mt-1">Historique des entrées, sorties et ajustements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Nouveau mouvement
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total mouvements</p>
          <p className="text-2xl font-bold text-white mt-1">{movements.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total entrées</p>
          <p className="text-2xl font-bold text-green-400 mt-1">+{totalIn}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total sorties</p>
          <p className="text-2xl font-bold text-red-400 mt-1">-{totalOut}</p>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-indigo-700">
          <h2 className="text-white font-semibold mb-4">Enregistrer un mouvement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={form.itemId}
              onChange={(e) => setForm({ ...form, itemId: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Sélectionner un article</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            >
              <option value="IN">Entrée</option>
              <option value="OUT">Sortie</option>
              <option value="ADJUSTMENT">Ajustement</option>
              <option value="TRANSFER">Transfert</option>
            </select>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
              placeholder="Quantité"
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Motif (optionnel)"
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.itemId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
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

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filterType === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {t === 'ALL' ? `Tous (${movements.length})` : `${typeConfig[t]?.label || t} (${movements.filter((m) => m.type === t).length})`}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-slate-300 font-semibold">Aucun mouvement enregistré</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 text-sm font-medium p-4">Article</th>
                  <th className="text-center text-slate-400 text-sm font-medium p-4">Type</th>
                  <th className="text-center text-slate-400 text-sm font-medium p-4">Quantité</th>
                  <th className="text-left text-slate-400 text-sm font-medium p-4">Motif</th>
                  <th className="text-left text-slate-400 text-sm font-medium p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const tCfg = typeConfig[m.type] || { label: m.type, color: 'text-slate-400', icon: '•' };
                  return (
                    <tr key={m.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 text-white">{m.item?.name || m.itemId || '—'}</td>
                      <td className="p-4 text-center">
                        <span className={`font-semibold ${tCfg.color}`}>{tCfg.icon} {tCfg.label}</span>
                      </td>
                      <td className={`p-4 text-center font-bold ${tCfg.color}`}>
                        {m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : ''}{m.quantity} {m.item?.unit || ''}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">{m.reason || '—'}</td>
                      <td className="p-4 text-slate-400 text-sm">{new Date(m.createdAt).toLocaleString('fr-FR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
