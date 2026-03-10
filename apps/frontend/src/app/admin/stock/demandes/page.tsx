'use client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockApi } from '@/lib/api';
import { useState } from 'react';
import { Plus, ClipboardList, Clock, CheckCircle, XCircle, PackageCheck } from 'lucide-react';

interface StockRequest {
  id: string;
  status: string;
  priority?: string;
  reason?: string;
  createdAt: string;
  requestedBy?: string;
  item?: { id: string; name: string; unit?: string };
  itemId?: string;
  quantity: number;
}
interface StockItem {
  id: string;
  name: string;
  unit?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'En attente', color: 'text-gold-700',   bg: 'bg-gold-50',   border: 'border-gold-200',   icon: <Clock className="w-3.5 h-3.5" /> },
  APPROVED:  { label: 'Approuvée',  color: 'text-forest-700', bg: 'bg-forest-50', border: 'border-forest-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  REJECTED:  { label: 'Refusée',    color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    icon: <XCircle className="w-3.5 h-3.5" /> },
  FULFILLED: { label: 'Traitée',    color: 'text-maroni-700', bg: 'bg-maroni-50', border: 'border-maroni-200', icon: <PackageCheck className="w-3.5 h-3.5" /> },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  HIGH:   { label: '● Haute',   color: 'text-red-600' },
  NORMAL: { label: '● Normale', color: 'text-gold-600' },
  LOW:    { label: '● Basse',   color: 'text-muted-foreground' },
};

export default function StockDemandesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ itemId: '', quantity: 1, priority: 'NORMAL', reason: '' });
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { data: requests = [], isLoading, isError, refetch } = useQuery<StockRequest[]>({
    queryKey: ['stock-requests'],
    queryFn: () => stockApi.requests(),
  });

  const { data: items = [] } = useQuery<StockItem[]>({
    queryKey: ['stock-items-list'],
    queryFn: () => stockApi.items(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      stockApi.createRequest({ ...data, quantity: Number(data.quantity) }),
    onSuccess: () => {
      toast.success('Demande créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] });
      setShowForm(false);
      setForm({ itemId: '', quantity: 1, priority: 'NORMAL', reason: '' });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const filtered = filterStatus === 'ALL' ? requests : requests.filter((r) => r.status === filterStatus);
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Demandes de stock</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pendingCount > 0 ? `${pendingCount} demande(s) en attente` : 'Aucune demande en attente'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle demande
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, cfg]) => (
          <div key={status} className="lftg-card p-4">
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cfg.color} mb-1`}>
              {cfg.icon} {cfg.label}
            </div>
            <p className={`text-2xl font-bold ${cfg.color}`}>
              {requests.filter((r) => r.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {/* Formulaire nouvelle demande */}
      {showForm && (
        <div className="lftg-card p-6 border-forest-200">
          <h2 className="text-base font-semibold text-foreground mb-4">Créer une demande de réapprovisionnement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Article *</label>
              <select
                value={form.itemId}
                onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                onInput={(e) => setForm(prev => ({ ...prev, itemId: (e.target as HTMLSelectElement).value }))}
                className="w-full bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">Sélectionner un article</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Quantité demandée *</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                className="w-full bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Priorité</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="LOW">Basse priorité</option>
                <option value="NORMAL">Priorité normale</option>
                <option value="HIGH">Haute priorité</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Motif</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Motif de la demande"
                className="w-full bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>
          {createMutation.isError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {(createMutation.error as any)?.response?.data?.message || 'Erreur lors de la création'}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.itemId}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
            </button>
            <button
              onClick={() => setShowForm(false)}
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
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'].map((s) => {
            const cfg = statusConfig[s];
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === s
                    ? 'bg-forest-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {s === 'ALL'
                  ? `Toutes (${requests.length})`
                  : `${cfg?.label || s} (${requests.filter((r) => r.status === s).length})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Erreur de chargement */}
      {isError && (
        <div className="lftg-card p-4 border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <span className="text-sm">Impossible de charger les demandes.</span>
          <button onClick={() => refetch()} className="ml-auto text-sm underline font-medium">Réessayer</button>
        </div>
      )}

      {/* Liste des demandes */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="lftg-card flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="lftg-card p-12 text-center">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-foreground font-semibold">Aucune demande</p>
            <p className="text-muted-foreground text-sm mt-1">
              {filterStatus !== 'ALL' ? 'Aucune demande avec ce statut' : 'Cliquez sur "+ Nouvelle demande" pour commencer'}
            </p>
          </div>
        ) : (
          filtered.map((req) => {
            const sCfg = statusConfig[req.status] || statusConfig.PENDING;
            const pCfg = priorityConfig[req.priority || 'NORMAL'] || priorityConfig.NORMAL;
            return (
              <div key={req.id} className={`lftg-card p-4 ${sCfg.border}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground">{req.item?.name || req.itemId || '—'}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sCfg.bg} ${sCfg.border} border ${sCfg.color}`}>
                        {sCfg.icon} {sCfg.label}
                      </span>
                      <span className={`text-xs font-semibold ${pCfg.color}`}>{pCfg.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                      <span>Quantité : <span className="font-medium text-foreground">{req.quantity} {req.item?.unit || ''}</span></span>
                      {req.requestedBy && <span>Par : {req.requestedBy}</span>}
                      <span>{new Date(req.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {req.reason && (
                      <p className="text-xs text-muted-foreground mt-1.5 italic">&ldquo;{req.reason}&rdquo;</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
