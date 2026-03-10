'use client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockApi } from '@/lib/api';
import { useState } from 'react';
import { Plus, RefreshCw, TrendingUp, TrendingDown, ArrowLeftRight, Package } from 'lucide-react';

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  notes?: string;
  timestamp: string;
  item?: { id: string; name: string; unit?: string };
  itemId?: string;
}
interface StockItem {
  id: string;
  name: string;
  unit?: string;
  quantity?: number;
}

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  IN:         { label: 'Entrée',      color: 'text-forest-700', bg: 'bg-forest-100',  icon: <TrendingUp className="w-3.5 h-3.5" /> },
  OUT:        { label: 'Sortie',      color: 'text-red-700',    bg: 'bg-red-100',     icon: <TrendingDown className="w-3.5 h-3.5" /> },
  ADJUSTMENT: { label: 'Ajustement', color: 'text-gold-700',   bg: 'bg-gold-100',    icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
  TRANSFER:   { label: 'Transfert',  color: 'text-maroni-700', bg: 'bg-maroni-100',  icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
};

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
    notes: '',
    adjustmentSign: '+',
  });
  const [filterType, setFilterType] = useState('ALL');

  const { data: movements = [], isLoading, isError, refetch } = useQuery<StockMovement[]>({
    queryKey: ['stock-movements'],
    queryFn: () => stockApi.movements(),
    refetchInterval: 30000,
  });

  const { data: items = [] } = useQuery<StockItem[]>({
    queryKey: ['stock-items-list'],
    queryFn: () => stockApi.items(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      let qty = Number(data.quantity);
      if (data.type === 'ADJUSTMENT' && data.adjustmentSign === '-') {
        qty = -Math.abs(qty);
      } else if (data.type === 'OUT') {
        qty = -Math.abs(qty);
      }
      const { adjustmentSign, ...rest } = data;
      return stockApi.createMovement(data.itemId, {
        ...rest,
        quantity: qty,
        notes: data.notes || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Mouvement enregistré avec succès');
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-articles'] });
      queryClient.invalidateQueries({ queryKey: ['stock-items-list'] });
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
  const selectedItem = items.find((i) => i.id === form.itemId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mouvements de stock</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historique des entrées, sorties et ajustements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau mouvement
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="lftg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total mouvements</p>
          <p className="text-2xl font-bold text-foreground mt-1">{movements.length}</p>
        </div>
        <div className="lftg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total entrées</p>
          <p className="text-2xl font-bold text-forest-600 mt-1">+{totalIn}</p>
        </div>
        <div className="lftg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total sorties</p>
          <p className="text-2xl font-bold text-red-600 mt-1">-{totalOut}</p>
        </div>
      </div>

      {/* Formulaire nouveau mouvement */}
      {showForm && (
        <div className="lftg-card p-6 border-forest-200">
          <h2 className="text-base font-semibold text-foreground mb-4">Enregistrer un mouvement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Article *</label>
              <select
                value={form.itemId}
                onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                className="w-full bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">Sélectionner un article</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.quantity !== undefined ? `(${item.quantity} ${item.unit || ''})` : ''}
                  </option>
                ))}
              </select>
              {selectedItem && (
                <p className="text-xs text-muted-foreground mt-1">
                  Stock actuel : <span className="font-semibold text-foreground">{selectedItem.quantity} {selectedItem.unit}</span>
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type de mouvement *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="IN">Entrée (+)</option>
                <option value="OUT">Sortie (−)</option>
                <option value="ADJUSTMENT">Ajustement</option>
                <option value="TRANSFER">Transfert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Quantité *
                {form.type === 'ADJUSTMENT' && (
                  <span className="ml-2 text-xs text-muted-foreground">(signe : </span>
                )}
                {form.type === 'ADJUSTMENT' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, adjustmentSign: '+' })}
                      className={`ml-1 px-1.5 py-0.5 rounded text-xs font-bold ${form.adjustmentSign === '+' ? 'bg-forest-600 text-white' : 'bg-muted text-muted-foreground'}`}
                    >+</button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, adjustmentSign: '-' })}
                      className={`ml-1 px-1.5 py-0.5 rounded text-xs font-bold ${form.adjustmentSign === '-' ? 'bg-red-600 text-white' : 'bg-muted text-muted-foreground'}`}
                    >−</button>
                    <span className="text-xs text-muted-foreground">)</span>
                  </>
                )}
              </label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                className="w-full bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Notes / Motif</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex: Livraison fournisseur, consommation..."
                className="w-full bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>
          {createMutation.isError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {(createMutation.error as any)?.response?.data?.message || 'Erreur lors de l\'enregistrement'}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.itemId || form.quantity <= 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer le mouvement'}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm({ itemId: '', type: 'IN', quantity: 1, notes: '', adjustmentSign: '+' }); }}
              className="px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="lftg-card p-4">
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'].map((t) => {
            const cfg = typeConfig[t];
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === t
                    ? 'bg-forest-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t === 'ALL'
                  ? `Tous (${movements.length})`
                  : `${cfg?.label || t} (${movements.filter((m) => m.type === t).length})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Erreur de chargement */}
      {isError && (
        <div className="lftg-card p-4 border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <span className="text-sm">Impossible de charger les mouvements.</span>
          <button onClick={() => refetch()} className="ml-auto text-sm underline font-medium">Réessayer</button>
        </div>
      )}

      {/* Tableau */}
      <div className="lftg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-foreground font-semibold">Aucun mouvement enregistré</p>
            <p className="text-muted-foreground text-sm mt-1">Cliquez sur &quot;+ Nouveau mouvement&quot; pour commencer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Article</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Type</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Quantité</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Notes</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const tCfg = typeConfig[m.type];
                  const dateStr = m.timestamp
                    ? new Date(m.timestamp).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
                    : '—';
                  return (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{m.item?.name || m.itemId || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {tCfg ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tCfg.bg} ${tCfg.color}`}>
                            {tCfg.icon} {tCfg.label}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{m.type}</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-center text-sm font-bold ${tCfg?.color || 'text-foreground'}`}>
                        {getQuantitySign(m.type, m.quantity)}{Math.abs(m.quantity)} {m.item?.unit || ''}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{m.notes || '—'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{dateStr}</td>
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
