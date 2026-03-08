'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface KiosqueTask {
  id: string;
  type: string;
  title: string;
  animal?: string;
  species?: string;
  enclos?: string;
  time?: string;
  status: string;
  priority?: string;
  notes?: string;
  duration?: number;
}

interface KiosqueAlert {
  id: string;
  type: string;
  message: string;
  severity: string;
  createdAt?: string;
}

const typeIcons: Record<string, string> = { FEEDING: '🍎', MEDICAL: '💊', CLEANING: '🧹', OBSERVATION: '🔭', TREATMENT: '💉', OTHER: '📋' };
const typeLabels: Record<string, string> = { FEEDING: 'Nourrissage', MEDICAL: 'Médical', CLEANING: 'Nettoyage', OBSERVATION: 'Observation', TREATMENT: 'Traitement', OTHER: 'Autre' };
const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  COMPLETED: { label: 'Terminé', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700' },
  IN_PROGRESS: { label: 'En cours', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-700' },
  PENDING: { label: 'En attente', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700' },
  CANCELLED: { label: 'Annulé', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700' },
};
const priorityConfig: Record<string, { label: string; color: string }> = {
  HIGH: { label: 'Haute', color: 'text-red-400' },
  NORMAL: { label: 'Normale', color: 'text-yellow-400' },
  LOW: { label: 'Basse', color: 'text-slate-400' },
};

export default function KiosquePage() {
  const queryClient = useQueryClient();
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'alerts'>('tasks');

  const { data: tasks = [], isLoading: loadingTasks } = useQuery<KiosqueTask[]>({
    queryKey: ['kiosque-tasks'],
    queryFn: async () => {
      const res = await api.get('/kiosque/tasks');
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 30000,
  });

  const { data: alerts = [], isLoading: loadingAlerts } = useQuery<KiosqueAlert[]>({
    queryKey: ['kiosque-alerts'],
    queryFn: async () => {
      const res = await api.get('/kiosque/alerts');
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 30000,
  });

  const scanMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/kiosque/scan', { code });
      return res.data;
    },
    onSuccess: (data) => {
      setScanResult(data?.message || 'Scan enregistré');
      queryClient.invalidateQueries({ queryKey: ['kiosque-tasks'] });
    },
    onError: () => setScanResult('Erreur lors du scan'),
  });

  const handleScan = () => {
    if (scanInput.trim()) {
      scanMutation.mutate(scanInput.trim());
      setScanInput('');
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'COMPLETED').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kiosque soigneurs</h1>
          <p className="text-slate-400 mt-1">Tâches quotidiennes et suivi terrain</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <p className="text-white font-semibold">{completedCount}/{tasks.length} tâches terminées</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Terminées', value: completedCount, color: 'text-green-400' },
          { label: 'En cours', value: inProgressCount, color: 'text-blue-400' },
          { label: 'En attente', value: pendingCount, color: 'text-yellow-400' },
          { label: 'Haute priorité', value: highPriorityCount, color: 'text-red-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Scanner QR */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h2 className="text-white font-semibold mb-3">📷 Scanner QR / Badge</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            placeholder="Code QR ou badge..."
            className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleScan}
            disabled={scanMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {scanMutation.isPending ? '...' : 'Scanner'}
          </button>
        </div>
        {scanResult && (
          <p className={`mt-2 text-sm ${scanResult.includes('Erreur') ? 'text-red-400' : 'text-green-400'}`}>{scanResult}</p>
        )}
      </div>

      {/* Onglets */}
      <div className="flex gap-2">
        {(['tasks', 'alerts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {tab === 'tasks' ? `Tâches (${tasks.length})` : `Alertes (${alerts.length})`}
          </button>
        ))}
      </div>

      {/* Liste des tâches */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {loadingTasks ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-slate-300 font-semibold">Aucune tâche pour aujourd'hui</p>
            </div>
          ) : (
            tasks.map((task) => {
              const sCfg = statusConfig[task.status] || statusConfig.PENDING;
              const pCfg = priorityConfig[task.priority || 'NORMAL'] || priorityConfig.NORMAL;
              return (
                <div key={task.id} className={`bg-slate-800 rounded-xl p-4 border ${sCfg.border} transition-all`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{typeIcons[task.type] || '📋'}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold">{task.title}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${sCfg.bg} ${sCfg.border} ${sCfg.color}`}>
                            {sCfg.label}
                          </span>
                          <span className={`text-xs font-semibold ${pCfg.color}`}>{pCfg.label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-slate-400 text-sm flex-wrap">
                          {task.time && <span>🕐 {task.time}</span>}
                          {task.enclos && <span>📍 {task.enclos}</span>}
                          {task.animal && <span>🦜 {task.animal}</span>}
                          {task.duration && <span>⏱ {task.duration} min</span>}
                        </div>
                        {task.notes && <p className="text-slate-400 text-sm mt-1 italic">{task.notes}</p>}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                      {typeLabels[task.type] || task.type}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Alertes */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {loadingAlerts ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-slate-300 font-semibold">Aucune alerte active</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={`bg-slate-800 rounded-xl p-4 border ${alert.severity === 'HIGH' ? 'border-red-700' : alert.severity === 'MEDIUM' ? 'border-yellow-700' : 'border-slate-700'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{alert.severity === 'HIGH' ? '🚨' : alert.severity === 'MEDIUM' ? '⚠️' : 'ℹ️'}</span>
                  <div>
                    <p className="text-white font-semibold">{alert.message}</p>
                    {alert.createdAt && (
                      <p className="text-slate-400 text-sm">{new Date(alert.createdAt).toLocaleString('fr-FR')}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
