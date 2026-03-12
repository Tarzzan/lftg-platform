'use client';
import { toast } from 'sonner';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:bg-gray-700 dark:text-gray-400',
  REFUNDED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  COMPLETED: 'Complétée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
};

const TYPE_ICONS: Record<string, string> = {
  ANIMAL: '/icons/section-animaux.png',
  PRODUCT: '/icons/section-stock.png',
  SERVICE: '',
  FORMATION: '/icons/section-formation.png',
};

interface SaleForm {
  type: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  notes: string;
  paymentMethod: string;
  dueDate: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; taxRate: number }>;
}

export default function VentesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<SaleForm>({
    type: 'ANIMAL',
    buyerName: '', buyerEmail: '', buyerPhone: '', buyerAddress: '',
    notes: '', paymentMethod: 'VIREMENT', dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 20 }],
  });

  const { data: sales, isLoading, isError, error } = useQuery({
    queryKey: ['sales', filterStatus, filterType, search],
    queryFn: () => api.get('/ventes', {
      params: { status: filterStatus || undefined, type: filterType || undefined, search: search || undefined },
    }).then(r => Array.isArray(r.data) ? r.data : (r.data?.data ?? [])),
  });

  const { data: stats } = useQuery({
    queryKey: ['sales-stats'],
    queryFn: () => api.get('/ventes/stats').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/ventes', data),
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-stats'] });
      setShowModal(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/ventes/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-stats'] });
    },
  });

  const addItem = () => setForm(p => ({
    ...p,
    items: [...p.items, { description: '', quantity: 1, unitPrice: 0, taxRate: 20 }],
  }));

  const removeItem = (i: number) => setForm(p => ({
    ...p,
    items: p.items.filter((_, idx) => idx !== i),
  }));

  const updateItem = (i: number, field: string, value: any) => setForm(p => ({
    ...p,
    items: p.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item),
  }));

  const subtotal = form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxTotal = form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100), 0);
  const total = subtotal + taxTotal;

  const salesList = sales || [];

  // Données pour le graphique (7 derniers jours)
  const chartData = stats?.dailyRevenue || Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString('fr-FR', { weekday: 'short' }), revenue: 0, count: 0 };
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-white">Ventes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats?.totalSales || 0} vente(s) · {(stats?.totalRevenue || 0).toFixed(0)} € de CA
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 transition-colors"
        >
          + Nouvelle vente
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'CA total', value: `${(stats.totalRevenue || 0).toFixed(0)} €`, icon: '/icons/section-finance.png', color: 'green' },
            { label: 'CA ce mois', value: `${(stats.monthRevenue || 0).toFixed(0)} €`, icon: '', color: 'blue' },
            { label: 'Ventes complétées', value: stats.completedCount || 0, icon: '', color: 'green' },
            { label: 'En attente', value: stats.pendingCount || 0, icon: '⏳', color: 'amber' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-border dark:border-gray-700 p-4 text-center">
              <div className="text-2xl mb-1">{kpi.icon}</div>
              <div className="text-xl font-bold text-gray-900 dark:text-foreground dark:text-white">{kpi.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Graphique revenus */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-border dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-foreground dark:text-white mb-4">Revenus des 7 derniers jours</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#166534" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#166534" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any) => [`${Number(v).toFixed(0)} €`, 'Revenus']} />
            <Area type="monotone" dataKey="revenue" stroke="#166534" fill="url(#revenueGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Rechercher (référence, acheteur)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
        >
          <option value="">Tous les types</option>
          {Object.entries(TYPE_ICONS).map(([k, v]) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <button
          onClick={() => api.get('/reports/sales', { params: { dateFrom: '2026-01-01', dateTo: '2026-12-31' }, responseType: 'blob' }).then(r => {
            const url = URL.createObjectURL(r.data);
            const a = document.createElement('a'); a.href = url; a.download = 'rapport-ventes.pdf'; a.click();
          })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:bg-muted/20 dark:hover:bg-gray-700 transition-colors"
        >
          Export PDF
        </button>
      </div>

      {/* Tableau */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600" />
        </div>
      ) : salesList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <img src="/icons/section-finance.png" alt="" className="w-10 h-10 object-cover rounded-xl mx-auto mb-3" />
          <p>Aucune vente trouvée</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-border dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-muted/20 dark:bg-gray-700/50">
              <tr>
                {['Référence', 'Acheteur', 'Type', 'Date', 'Statut', 'Total', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {salesList.map((sale: any) => (
                <tr key={sale.id} className="hover:bg-gray-50 dark:bg-muted/20 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/admin/ventes/${sale.id}`)}
                      className="font-mono text-sm font-semibold text-forest-600 hover:underline"
                    >
                      {sale.reference}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-foreground dark:text-white">{sale.buyerName}</p>
                      {sale.buyerEmail && <p className="text-xs text-gray-400">{sale.buyerEmail}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{sale.type}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(sale.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[sale.status]}`}>
                      {STATUS_LABELS[sale.status] || sale.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-foreground dark:text-white">
                    {sale.total.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {sale.status === 'PENDING' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: sale.id, status: 'CONFIRMED' })}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Confirmer
                        </button>
                      )}
                      {sale.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: sale.id, status: 'COMPLETED' })}
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                        >
                          Compléter
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/admin/ventes/${sale.id}`)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:bg-muted/20 dark:hover:bg-gray-700 transition-colors"
                      >
                        Voir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-border dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-foreground dark:text-white">Nouvelle vente</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 text-xl">×</button>
            </div>
            <div className="p-6 space-y-5">
              {/* Informations acheteur */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-3">Acheteur</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Nom complet *"
                      value={form.buyerName}
                      onChange={e => setForm(p => ({ ...p, buyerName: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.buyerEmail}
                    onChange={e => setForm(p => ({ ...p, buyerEmail: e.target.value }))}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone"
                    value={form.buyerPhone}
                    onChange={e => setForm(p => ({ ...p, buyerPhone: e.target.value }))}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                  />
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Adresse"
                      value={form.buyerAddress}
                      onChange={e => setForm(p => ({ ...p, buyerAddress: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Type et paiement */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                  >
                    {Object.entries(TYPE_ICONS).map(([k, v]) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Paiement</label>
                  <select
                    value={form.paymentMethod}
                    onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                  >
                    <option value="VIREMENT">Virement</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="ESPECES">Espèces</option>
                    <option value="CB">Carte bancaire</option>
                    <option value="PAYPAL">PayPal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Échéance</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                  />
                </div>
              </div>

              {/* Lignes de vente */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300">Articles</h3>
                  <button
                    onClick={addItem}
                    className="text-xs text-forest-600 hover:text-forest-700 font-medium"
                  >
                    + Ajouter une ligne
                  </button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={e => updateItem(i, 'description', e.target.value)}
                        className="col-span-5 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qté"
                        value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                        className="col-span-2 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Prix HT"
                        value={item.unitPrice}
                        onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="col-span-3 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                      />
                      <select
                        value={item.taxRate}
                        onChange={e => updateItem(i, 'taxRate', parseFloat(e.target.value))}
                        className="col-span-1 border border-gray-300 dark:border-gray-600 rounded-lg px-1 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                      >
                        <option value={0}>0%</option>
                        <option value={5.5}>5.5%</option>
                        <option value={10}>10%</option>
                        <option value={20}>20%</option>
                      </select>
                      {form.items.length > 1 && (
                        <button
                          onClick={() => removeItem(i)}
                          className="col-span-1 text-red-400 hover:text-red-600 text-center"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-muted/20 dark:bg-gray-700/50 rounded-lg space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Sous-total HT</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>TVA</span>
                    <span>{taxTotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-foreground dark:text-white border-t border-gray-200 dark:border-border dark:border-gray-600 pt-1 mt-1">
                    <span>Total TTC</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                  placeholder="Notes internes..."
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-border dark:border-gray-700">
              <button
                onClick={() => createMutation.mutate({
                  type: form.type,
                  buyerName: form.buyerName,
                  buyerEmail: form.buyerEmail || undefined,
                  buyerPhone: form.buyerPhone || undefined,
                  buyerAddress: form.buyerAddress || undefined,
                  notes: form.notes || undefined,
                  paymentMethod: form.paymentMethod,
                  dueDate: form.dueDate || undefined,
                  items: form.items.filter(i => i.description),
                })}
                disabled={!form.buyerName || form.items.every(i => !i.description) || createMutation.isPending}
                className="flex-1 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? 'Création...' : `Créer la vente (${total.toFixed(2)} €)`}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-50 dark:bg-muted/20 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
