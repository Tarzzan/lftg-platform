'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  succeeded: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function StripePage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data: stats, isLoading: loadingStats, isError: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['stripe-stats', period],
    queryFn: () => api.get(`/stripe/stats?period=${period}`).then(r => r.data),
  });

  const { data: transactions, isLoading: loadingTx } = useQuery({
    queryKey: ['stripe-transactions', period],
    queryFn: () => api.get(`/stripe/transactions?period=${period}&limit=50`).then(r => r.data),
  });

  const kpis = [
    { label: 'Solde disponible', value: stats?.balance != null ? `${stats.balance.toFixed(2)} €` : '—', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: null },
    { label: 'En attente', value: stats?.pending != null ? `${stats.pending.toFixed(2)} €` : '—', icon: RefreshCw, color: 'text-yellow-600', bg: 'bg-yellow-50', trend: null },
    { label: `Revenus (${period === 'week' ? 'semaine' : period === 'month' ? 'mois' : 'année'})`, value: stats?.monthRevenue != null ? `${stats.monthRevenue.toFixed(2)} €` : '—', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', trend: stats?.revenueChange },
    { label: 'Transactions', value: stats?.transactions ?? '—', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50', trend: null },
  ];

  const txList: any[] = Array.isArray(transactions) ? transactions : (transactions?.data ?? []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-indigo-600" />
            Paiements Stripe
          </h1>
          <p className="text-gray-500 mt-1">Tableau de bord des paiements et transactions</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
            </button>
          ))}
          <button onClick={() => refetchStats()} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {loadingStats ? <span className="animate-pulse bg-gray-200 rounded h-7 w-20 block" /> : kpi.value}
              </span>
              {kpi.trend != null && (
                <span className={`flex items-center text-xs font-medium ${kpi.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(kpi.trend).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Transactions récentes</h2>
          <span className="text-sm text-gray-500">{txList.length} transaction{txList.length !== 1 ? 's' : ''}</span>
        </div>
        {loadingTx ? (
          <div className="p-8 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Chargement...
          </div>
        ) : txList.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Aucune transaction pour cette période</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {txList.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{tx.id?.slice(0, 12)}...</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {tx.amount != null ? `${(tx.amount / 100).toFixed(2)} ${(tx.currency ?? 'eur').toUpperCase()}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[tx.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {tx.status ?? 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{tx.description ?? tx.metadata?.description ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {tx.created ? new Date(tx.created * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {tx.receipt_url && (
                        <a href={tx.receipt_url} target="_blank" rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs">
                          <ExternalLink className="w-3 h-3" />
                          Reçu
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
