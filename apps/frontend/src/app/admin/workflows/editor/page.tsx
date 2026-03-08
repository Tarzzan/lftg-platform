'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitBranch, Plus, Play, Pause, Trash2, Clock, CheckCircle, XCircle, RefreshCw, ChevronRight, Zap } from 'lucide-react';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  running: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export default function WorkflowsEditorPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'definitions' | 'instances'>('definitions');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', trigger: 'manual' });

  const { data: definitions, isLoading: loadingDefs } = useQuery({
    queryKey: ['workflow-definitions'],
    queryFn: () => api.get('/workflows/definitions').then(r => r.data),
  });

  const { data: instances, isLoading: loadingInst } = useQuery({
    queryKey: ['workflow-instances'],
    queryFn: () => api.get('/workflows/instances').then(r => r.data),
    refetchInterval: 10000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/workflows/definitions', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflow-definitions'] }); setShowForm(false); setForm({ name: '', description: '', trigger: 'manual' }); },
  });

  const triggerMutation = useMutation({
    mutationFn: (defId: string) => api.post('/workflows/instances', { definitionId: defId }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflow-instances'] }); setActiveTab('instances'); },
  });

  const defs: any[] = Array.isArray(definitions) ? definitions : (definitions?.data ?? []);
  const insts: any[] = Array.isArray(instances) ? instances : (instances?.data ?? []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="w-7 h-7 text-indigo-600" />
            Workflows
          </h1>
          <p className="text-gray-500 mt-1">Automatisation des processus métier</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nouveau workflow
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['definitions', 'instances'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'definitions' ? `Définitions (${defs.length})` : `Instances (${insts.length})`}
          </button>
        ))}
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Nouveau workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Notification naissance animal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Déclencheur</label>
              <select value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="manual">Manuel</option>
                <option value="animal.born">Naissance animal</option>
                <option value="medical.created">Visite médicale</option>
                <option value="sale.created">Vente</option>
                <option value="cron">Planifié (Cron)</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2} placeholder="Description du workflow..." />
          </div>
          <div className="flex gap-2">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.name}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Annuler</button>
          </div>
        </div>
      )}

      {/* Définitions */}
      {activeTab === 'definitions' && (
        <div className="space-y-3">
          {loadingDefs ? (
            <div className="text-center py-8 text-gray-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement...</div>
          ) : defs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun workflow défini</p>
              <p className="text-sm mt-1">Créez votre premier workflow pour automatiser vos processus</p>
            </div>
          ) : defs.map((def: any) => (
            <div key={def.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Zap className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{def.name}</p>
                    <p className="text-xs text-gray-500">{def.description ?? 'Aucune description'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[def.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {def.status ?? 'inactive'}
                      </span>
                      {def.trigger && <span className="text-xs text-gray-400">Déclencheur: {def.trigger}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => triggerMutation.mutate(def.id)} disabled={triggerMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs transition-colors">
                    <Play className="w-3 h-3" />
                    Exécuter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instances */}
      {activeTab === 'instances' && (
        <div className="space-y-3">
          {loadingInst ? (
            <div className="text-center py-8 text-gray-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement...</div>
          ) : insts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune instance en cours</p>
            </div>
          ) : insts.map((inst: any) => (
            <div key={inst.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${inst.status === 'completed' ? 'bg-green-50' : inst.status === 'failed' ? 'bg-red-50' : 'bg-blue-50'}`}>
                  {inst.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                   inst.status === 'failed' ? <XCircle className="w-4 h-4 text-red-600" /> :
                   <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{inst.definitionName ?? inst.workflowName ?? `Instance #${inst.id?.slice(0, 8)}`}</p>
                  <p className="text-xs text-gray-500">
                    {inst.startedAt ? new Date(inst.startedAt).toLocaleString('fr-FR') : '—'}
                    {inst.completedAt && ` → ${new Date(inst.completedAt).toLocaleString('fr-FR')}`}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inst.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {inst.status ?? 'unknown'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
