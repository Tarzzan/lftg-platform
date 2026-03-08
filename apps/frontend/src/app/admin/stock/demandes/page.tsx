'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

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

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING: { label: 'En attente', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700' },
  APPROVED: { label: 'Approuvée', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700' },
  REJECTED: { label: 'Refusée', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700' },
  FULFILLED: { label: 'Traitée', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-700' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  HIGH: { label: 'Haute', color: 'text-red-400' },
  NORMAL: { label: 'Normale', color: 'text-yellow-400' },
  LOW: { label: 'Basse', color: 'text-slate-400' },
};

export default function StockDemandesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ itemId: '', quantity: 1, priority: 'NORMAL', reason: '' });
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { data: requests = [], isLoading } = useQuery<StockRequest[]>({
    queryKey: ['stock-requests'],
    queryFn: async () => {
      const res = await api.get('/plugins/stock/requests');
      return Array.isArray(res.data) ? res.data : [];
    },
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
      const res = await api.post('/plugins/stock/requests', { ...data, quantity: Number(data.quantity) });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] });
      setShowForm(false);
      setForm({ itemId: '', quantity: 1, priority: 'NORMAL', reason: '' });
    },
  });

  const filtered = filterStatus === 'ALL' ? requests : requests.filter((r) => r.status === filterStatus);
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Demandes de stock</h1>
          <p className="text-slate-400 mt-1">{pendingCount > 0 ? `${pendingCount} demande(s) en attente` : 'Aucune demande en attente'}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Nouvelle demande
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, cfg]) => (
          <div key={status} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">{cfg.label}</p>
            <p className={`text-2xl font-bold mt-1 ${cfg.color}`}>{requests.filter((r) => r.status === status).length}</p>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-indigo-700">
          <h2 className="text-white font-semibold mb-4">Créer une demande de réapprovisionnement</h2>
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
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
              placeholder="Quantité demandée"
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            >
              <option value="LOW">Basse priorité</option>
              <option value="NORMAL">Priorité normale</option>
              <option value="HIGH">Haute priorité</option>
            </select>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Motif de la demande"
              className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.itemId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
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
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {s === 'ALL' ? `Toutes (${requests.length})` : `${statusConfig[s]?.label || s} (${requests.filter((r) => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-300 font-semibold">Aucune demande</p>
          </div>
        ) : (
          filtered.map((req) => {
            const sCfg = statusConfig[req.status] || statusConfig.PENDING;
            const pCfg = priorityConfig[req.priority || 'NORMAL'] || priorityConfig.NORMAL;
            return (
              <div key={req.id} className={`bg-slate-800 rounded-xl p-4 border ${sCfg.border}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold">{req.item?.name || req.itemId || '—'}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${sCfg.bg} ${sCfg.border} ${sCfg.color}`}>
                        {sCfg.label}
                      </span>
                      <span className={`text-xs font-semibold ${pCfg.color}`}>{pCfg.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-slate-400 text-sm flex-wrap">
                      <span>Quantité : {req.quantity} {req.item?.unit || ''}</span>
                      {req.requestedBy && <span>Par : {req.requestedBy}</span>}
                      <span>{new Date(req.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {req.reason && <p className="text-slate-400 text-sm mt-1 italic">{req.reason}</p>}
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
