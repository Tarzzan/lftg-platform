// DYNAMIC VERSION - Connected to API
'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const LEAVE_TYPES = [
  { value: 'conge_paye', label: 'Congés payés' },
  { value: 'rtt', label: 'RTT' },
  { value: 'maladie', label: 'Maladie' },
  { value: 'sans_solde', label: 'Sans solde' },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  approved: { label: 'Approuvé', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  refused: { label: 'Refusé', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

export default function CongesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', type: 'conge_paye', startDate: '', endDate: '', reason: '' });

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: () => api.get('/plugins/personnel/leaves').then(r => r.data),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.get('/plugins/personnel/employees').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/plugins/personnel/leaves', data),
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      qc.invalidateQueries({ queryKey: ['leaves'] });
      setShowForm(false);
      setForm({ employeeId: '', type: 'conge_paye', startDate: '', endDate: '', reason: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/plugins/personnel/leaves/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const filtered = leaves.filter((l: any) => {
    const emp = employees.find((e: any) => e.id === l.employeeId);
    const name = emp ? `${emp.firstName} ${emp.lastName}` : '';
    return name.toLowerCase().includes(search.toLowerCase()) || l.type.includes(search.toLowerCase());
  });

  const getDays = (start: string, end: string) => {
    const s = new Date(start), e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des congés</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Suivi des demandes de congés du personnel</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Nouvelle demande
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'En attente', count: (leaves as any[]).filter((l) => l.status === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Approuvés', count: (leaves as any[]).filter((l) => l.status === 'approved').length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Refusés', count: (leaves as any[]).filter((l) => l.status === 'refused').length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className="text-sm text-gray-600 dark:text-gray-400">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par employé ou type..." className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : (filtered as any[]).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucune demande de congé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(filtered as any[]).map((leave) => {
            const emp = (employees as any[]).find((e) => e.id === leave.employeeId);
            const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Employé inconnu';
            const typeLabel = LEAVE_TYPES.find(t => t.value === leave.type)?.label || leave.type;
            const statusInfo = STATUS_LABELS[leave.status] || STATUS_LABELS.pending;
            const days = getDays(leave.startDate, leave.endDate);
            return (
              <div key={leave.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{empName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{typeLabel} — {days} jour{days > 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                    </p>
                    {leave.reason && <p className="text-xs text-gray-500 mt-1 italic">"{leave.reason}"</p>}
                  </div>
                  {leave.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateMutation.mutate({ id: leave.id, status: 'approved' })} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Approuver">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => updateMutation.mutate({ id: leave.id, status: 'refused' })} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Refuser">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nouvelle demande de congé</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employé</label>
                <select value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-sm">
                  <option value="">Sélectionner un employé</option>
                  {(employees as any[]).map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de congé</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-sm">
                  {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date début</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date fin</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif (optionnel)</label>
                <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium">Annuler</button>
              <button
                onClick={() => createMutation.mutate({ ...form, startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString() })}
                disabled={!form.employeeId || !form.startDate || !form.endDate || createMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Enregistrement...' : 'Créer la demande'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
