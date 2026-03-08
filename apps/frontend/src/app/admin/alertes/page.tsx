'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  title: string;
  message: string;
  entityName: string;
  entityType: string;
  value?: number;
  threshold?: number;
  unit?: string;
  triggeredAt: string;
  acknowledged: boolean;
  resolved?: boolean;
}

interface AlertStats {
  total: number;
  active: number;
  critical: number;
  warning: number;
  info: number;
  unacknowledged: number;
  resolved: number;
}

const severityConfig = {
  critical: { label: 'Critique', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700', dot: 'bg-red-500' },
  warning: { label: 'Avertissement', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700', dot: 'bg-yellow-500' },
  info: { label: 'Information', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-700', dot: 'bg-blue-500' },
};

export default function AlertesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info' | 'unacknowledged'>('all');

  const { data: alerts = [], isLoading: loadingAlerts, isError: errorAlerts } = useQuery<Alert[]>({
    queryKey: ['alertes', filter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filter === 'unacknowledged') params.acknowledged = 'false';
      else if (filter !== 'all') params.severity = filter;
      const res = await api.get('/alertes', { params });
      return res.data;
    },
    refetchInterval: 30000,
  });

  const { data: stats, isLoading: loadingStats } = useQuery<AlertStats>({
    queryKey: ['alertes-stats'],
    queryFn: async () => {
      const res = await api.get('/alertes/stats');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await api.patch(`/alertes/${alertId}/acknowledge`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['alertes'] });
      queryClient.invalidateQueries({ queryKey: ['alertes-stats'] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await api.patch(`/alertes/${alertId}/resolve`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['alertes'] });
      queryClient.invalidateQueries({ queryKey: ['alertes-stats'] });
    },
  });

  const isLoading = loadingAlerts || loadingStats;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alertes & Surveillance</h1>
          <p className="text-slate-400 mt-1">Monitoring en temps réel — actualisation toutes les 30s</p>
        </div>
        {stats && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-900/30 text-red-400 text-sm font-semibold border border-red-700">
              {stats.critical} critique{stats.critical > 1 ? 's' : ''}
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-900/30 text-yellow-400 text-sm font-semibold border border-yellow-700">
              {stats.unacknowledged} non acquittée{stats.unacknowledged > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total alertes', value: stats.total, color: 'text-slate-300' },
            { label: 'Actives', value: stats.active, color: 'text-orange-400' },
            { label: 'Critiques', value: stats.critical, color: 'text-red-400' },
            { label: 'Résolues', value: stats.resolved, color: 'text-green-400' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'critical', 'warning', 'info', 'unacknowledged'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {f === 'all' ? 'Toutes' : f === 'unacknowledged' ? 'Non acquittées' : f === 'critical' ? 'Critiques' : f === 'warning' ? 'Avertissements' : 'Informations'}
          </button>
        ))}
      </div>

      {/* Liste des alertes */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : errorAlerts ? (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 text-center text-red-400">
          Erreur lors du chargement des alertes
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-slate-300 font-semibold">Aucune alerte active</p>
          <p className="text-slate-500 text-sm mt-1">Tous les systèmes fonctionnent normalement</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const cfg = severityConfig[alert.severity] || severityConfig.info;
            return (
              <div
                key={alert.id}
                className={`rounded-xl p-4 border ${cfg.bg} ${cfg.border} ${alert.acknowledged ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot} ${!alert.acknowledged ? 'animate-pulse' : ''}`} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">{alert.type}</span>
                        {alert.acknowledged && (
                          <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded border border-green-700">Acquittée</span>
                        )}
                        {alert.resolved && (
                          <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">Résolue</span>
                        )}
                      </div>
                      <p className="text-white font-semibold mt-1">{alert.title}</p>
                      <p className="text-slate-400 text-sm mt-0.5">{alert.message}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {alert.entityName} · {new Date(alert.triggeredAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        disabled={acknowledgeMutation.isPending}
                        className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                      >
                        Acquitter
                      </button>
                    )}
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveMutation.mutate(alert.id)}
                        disabled={resolveMutation.isPending}
                        className="px-3 py-1.5 text-xs bg-green-800 hover:bg-green-700 text-green-300 rounded-lg transition-colors"
                      >
                        Résoudre
                      </button>
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
