'use client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  notes?: string;       // BUG 3 FIX: l'API retourne "notes", pas "reason"
  timestamp: string;    // BUG 4 FIX: l'API retourne "timestamp", pas "createdAt"
  item?: { id: string; name: string; unit?: string };
  itemId?: string;
}

interface StockItem {
  id: string;
  name: string;
  unit?: string;
  quantity?: number;
}

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  IN:         { label: 'Entrée',      color: 'text-green-400',  icon: '↑' },
  OUT:        { label: 'Sortie',      color: 'text-red-400',    icon: '↓' },
  ADJUSTMENT: { label: 'Ajustement', color: 'text-yellow-400', icon: '⇄' },
  TRANSFER:   { label: 'Transfert',  color: 'text-blue-400',   icon: '→' },
};

// BUG 2 FIX : pour les ajustements, la quantité peut être négative
function getQuantitySign(type: string, quantity: number): string {
  if (type === 'IN') return '+';
  if (type === 'OUT') return '-';
  if (type === 'ADJUSTMENT') return quantity >= 0 ? '+' : '';
  return '';
}

export default function StockMouvementsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    itemId: '',
    type: 'IN',
    quantity: 1,
    notes: '',           // BUG 1 FIX: renommé de "reason" à "notes"
    adjustmentSign: '+', // BUG 2 FIX: signe séparé pour les ajustements
  });
  const [filterType, setFilterType] = useState('ALL');

  const { data: movements = [], isLoading, isError, refetch } = useQuery<StockMovement[]>({
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
      // BUG 2 FIX: pour les ajustements, appliquer le signe à la quantité
      let qty = Number(data.quantity);
      if (data.type === 'ADJUSTMENT' && data.adjustmentSign === '-') {
        qty = -Math.abs(qty);
      } else if (data.type === 'OUT') {
        qty = -Math.abs(qty); // Les sorties sont toujours négatives pour le calcul du stock
      }
      // BUG 1 FIX: envoyer "notes" au lieu de "reason"
      const { adjustmentSign, ...rest } = data;
      const res = await api.post('/plugins/stock/movements', {
        ...rest,
        quantity: qty,
        notes: data.notes || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Mouvement enregistré avec succès');
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-items-list'] });
      queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      setShowForm(false);
      setForm({ itemId: '', type: 'IN', quantity: 1, notes: '', adjustmentSign: '+' });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Erreur lors de l\'enregistrement';
      toast.error(msg);
    },
  });

  const filtered = filterType === 'ALL' ? movements : movements.filter((m) => m.type === filterType);

  const totalIn = movements.filter((m) => m.type === 'IN').reduce((s, m) => s + Math.abs(m.quantity), 0);
  const totalOut = movements.filter((m) => m.type === 'OUT').reduce((s, m) => s + Math.abs(m.quantity), 0);
  const totalAdjustments = movements.filter((m) => m.type === 'ADJUSTMENT').length;

  // Article sélectionné pour afficher le stock actuel
  const selectedItem = items.find((i) => i.id === form.itemId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mouvements de stock</h1>
          <p className="text-slate-400 mt-1">Historique des entrées, sorties et ajustements</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            title="Actualiser"
          >
            ↻
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            + Nouveau mouvement
          </button>
        </div>
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
          <p className="text-slate-400 text-sm">Ajustements</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{totalAdjustments}</p>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-indigo-700">
          <h2 className="text-white font-semibold mb-4">Enregistrer un mouvement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sélection article */}
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Article *</label>
              <select
                value={form.itemId}
                onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Sélectionner un article</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.quantity !== undefined ? `(${item.quantity} ${item.unit || ''})` : ''}
                  </option>
                ))}
              </select>
              {selectedItem && (
                <p className="text-slate-400 text-xs mt-1">
                  Stock actuel : <span className="text-white font-semibold">{selectedItem.quantity} {selectedItem.unit}</span>
                </p>
              )}
            </div>

            {/* Type de mouvement */}
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Type de mouvement *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
              >
                <option value="IN">↑ Entrée (réception, achat)</option>
                <option value="OUT">↓ Sortie (utilisation, distribution)</option>
                <option value="ADJUSTMENT">⇄ Ajustement (correction, perte, casse)</option>
                <option value="TRANSFER">→ Transfert (entre enclos)</option>
              </select>
            </div>

            {/* Quantité — BUG 2 FIX : pour les ajustements, permettre négatif */}
            <div>
              <label className="text-slate-400 text-sm mb-1 block">
                Quantité *
                {form.type === 'ADJUSTMENT' && (
                  <span className="text-yellow-400 ml-2 text-xs">(+ pour ajout, − pour perte/casse)</span>
                )}
              </label>
              <div className="flex gap-2">
                {form.type === 'ADJUSTMENT' && (
                  <select
                    value={form.adjustmentSign}
                    onChange={(e) => setForm({ ...form, adjustmentSign: e.target.value })}
                    className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500 w-16"
                  >
                    <option value="+">+</option>
                    <option value="-">−</option>
                  </select>
                )}
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="Quantité"
                  className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              {form.type === 'ADJUSTMENT' && form.adjustmentSign === '-' && selectedItem && (
                <p className="text-yellow-400 text-xs mt-1">
                  Stock après ajustement : {(selectedItem.quantity || 0) - form.quantity} {selectedItem.unit}
                </p>
              )}
            </div>

            {/* Motif — BUG 1 FIX : champ "notes" */}
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Motif / Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={form.type === 'ADJUSTMENT' ? 'Ex: Bidon percé, inventaire, casse...' : 'Motif (optionnel)'}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Erreur mutation */}
          {createMutation.isError && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {(createMutation.error as any)?.response?.data?.message || 'Erreur lors de l\'enregistrement'}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.itemId || form.quantity <= 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer le mouvement'}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm({ itemId: '', type: 'IN', quantity: 1, notes: '', adjustmentSign: '+' }); }}
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
            {t === 'ALL'
              ? `Tous (${movements.length})`
              : `${typeConfig[t]?.label || t} (${movements.filter((m) => m.type === t).length})`}
          </button>
        ))}
      </div>

      {/* Erreur de chargement */}
      {isError && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-400 flex items-center gap-3">
          <span>⚠️</span>
          <span>Impossible de charger les mouvements.</span>
          <button onClick={() => refetch()} className="ml-auto text-sm underline">Réessayer</button>
        </div>
      )}

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
            <p className="text-slate-500 text-sm mt-1">Cliquez sur &quot;+ Nouveau mouvement&quot; pour commencer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 text-sm font-medium p-4">Article</th>
                  <th className="text-center text-slate-400 text-sm font-medium p-4">Type</th>
                  <th className="text-center text-slate-400 text-sm font-medium p-4">Quantité</th>
                  <th className="text-left text-slate-400 text-sm font-medium p-4">Motif / Notes</th>
                  <th className="text-left text-slate-400 text-sm font-medium p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const tCfg = typeConfig[m.type] || { label: m.type, color: 'text-slate-400', icon: '•' };
                  // BUG 4 FIX: utiliser "timestamp" au lieu de "createdAt"
                  const dateStr = m.timestamp
                    ? new Date(m.timestamp).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
                    : '—';
                  return (
                    <tr key={m.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 text-white font-medium">{m.item?.name || m.itemId || '—'}</td>
                      <td className="p-4 text-center">
                        <span className={`font-semibold ${tCfg.color}`}>{tCfg.icon} {tCfg.label}</span>
                      </td>
                      <td className={`p-4 text-center font-bold ${tCfg.color}`}>
                        {getQuantitySign(m.type, m.quantity)}{Math.abs(m.quantity)} {m.item?.unit || ''}
                      </td>
                      {/* BUG 3 FIX: afficher m.notes au lieu de m.reason */}
                      <td className="p-4 text-slate-400 text-sm">{m.notes || '—'}</td>
                      <td className="p-4 text-slate-400 text-sm">{dateStr}</td>
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
