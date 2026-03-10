'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, Play, Trash2, Mail, RefreshCw, CheckCircle, Calendar, FileText } from 'lucide-react';
import { api } from '@/lib/api';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  cites: { label: 'CITES', color: 'bg-purple-100 text-purple-800' },
  health: { label: 'Santé', color: 'bg-green-100 text-green-800' },
  sales: { label: 'Ventes', color: 'bg-blue-100 text-blue-800' },
  iot: { label: 'IoT', color: 'bg-orange-100 text-orange-800' },
  annual: { label: 'Annuel', color: 'bg-red-100 text-red-800' },
  stock: { label: 'Stock', color: 'bg-yellow-100 text-yellow-800' },
};

const FREQ_LABELS: Record<string, string> = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  yearly: 'Annuel',
};

export default function AutoReportsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'health', frequency: 'weekly', recipients: '' });
  const [runningId, setRunningId] = useState<string | null>(null);

  const { data: schedules, isLoading, isError, error } = useQuery({
    queryKey: ['auto-reports-schedules'],
    queryFn: () => api.get('/auto-reports/schedules').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/auto-reports/schedules', data).then(r => r.data),
    onSuccess: () => {
      toast.success('Opération réussie avec succès'); qc.invalidateQueries({ queryKey: ['auto-reports-schedules'] }); setShowForm(false); setForm({ name: '', type: 'health', frequency: 'weekly', recipients: '' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/auto-reports/schedules/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auto-reports-schedules'] }),
  });

  const runNowMutation = useMutation({
    mutationFn: (id: string) => api.post(`/auto-reports/schedules/${id}/run`).then(r => r.data),
    onSuccess: () => setRunningId(null),
  });

  const list: any[] = Array.isArray(schedules) ? schedules : (schedules?.data ?? []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <Clock className="w-7 h-7 text-indigo-600" />
            Rapports automatiques
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Planification et envoi automatique de rapports</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Planifier
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-foreground mb-4">Nouveau rapport planifié</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 dark:border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Bilan mensuel CITES" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de rapport</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 dark:border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fréquence</label>
              <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                className="w-full border border-gray-200 dark:border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destinataires (séparés par virgule)</label>
              <input value={form.recipients} onChange={e => setForm(f => ({ ...f, recipients: e.target.value }))}
                className="w-full border border-gray-200 dark:border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="admin@lftg.fr, draaf@guyane.fr" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => createMutation.mutate({ ...form, recipients: form.recipients.split(',').map(r => r.trim()).filter(Boolean) })}
              disabled={createMutation.isPending || !form.name}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
              {createMutation.isPending ? 'Création...' : 'Planifier'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 text-sm">Annuler</button>
          </div>
        </div>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun rapport planifié</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((s: any) => {
            const typeInfo = TYPE_LABELS[s.type] ?? { label: s.type, color: 'bg-gray-100 text-gray-700' };
            return (
              <div key={s.id} className="bg-white dark:bg-card rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{FREQ_LABELS[s.frequency] ?? s.frequency}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {Array.isArray(s.recipients) ? s.recipients.join(', ') : s.recipients}
                        </span>
                        {s.nextRun && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Prochain: {new Date(s.nextRun).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setRunningId(s.id); runNowMutation.mutate(s.id); }}
                      disabled={runNowMutation.isPending && runningId === s.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs transition-colors">
                      {runNowMutation.isPending && runningId === s.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      Exécuter
                    </button>
                    <button onClick={() => deleteMutation.mutate(s.id)} disabled={deleteMutation.isPending}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
