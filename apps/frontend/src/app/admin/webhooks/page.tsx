'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Webhook, Plus, Send, Trash2, CheckCircle, XCircle, Globe, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

const WEBHOOK_EVENTS = ['animal.born', 'animal.died', 'animal.updated', 'cites.updated', 'medical.created', 'medical.updated', 'sale.created', 'payment.received', 'species.updated'];

// Webhooks configurés localement (pas de modèle Prisma dédié)
const DEFAULT_WEBHOOKS = [
  { id: 'WH001', name: 'DRAAF Guyane', url: 'https://api.draaf.guyane.fr/webhook/lftg', events: ['animal.born', 'animal.died', 'cites.updated'], status: 'active' },
  { id: 'WH002', name: 'Clinique Vétérinaire Cayenne', url: 'https://api.clinique-cayenne.fr/hooks', events: ['medical.created', 'medical.updated'], status: 'active' },
  { id: 'WH003', name: 'GBIF', url: 'https://hooks.gbif.org/lftg-updates', events: ['animal.born', 'species.updated'], status: 'active' },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState(DEFAULT_WEBHOOKS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', events: [] as string[] });
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<null | { ok: boolean; message: string }>(null);

  const sendMutation = useMutation({
    mutationFn: ({ url, payload }: { url: string; payload: any }) =>
      api.post('/webhooks/send', { url, payload }).then(r => r.data),
    onSuccess: () => setTestResult({ ok: true, message: 'Webhook envoyé avec succès' }),
    onError: (e: any) => setTestResult({ ok: false, message: e?.response?.data?.message ?? 'Erreur lors de l\'envoi' }),
  });

  const handleToggleEvent = (event: string) => {
    setForm(f => ({
      ...f,
      events: f.events.includes(event) ? f.events.filter(e => e !== event) : [...f.events, event],
    }));
  };

  const handleAddWebhook = () => {
    if (!form.name || !form.url) return;
    setWebhooks(prev => [...prev, { id: `WH${Date.now()}`, ...form, status: 'active' }]);
    setForm({ name: '', url: '', events: [] });
    setShowForm(false);
  };

  const handleTest = () => {
    if (!testUrl) return;
    setTestResult(null);
    sendMutation.mutate({ url: testUrl, payload: { event: 'test.ping', timestamp: new Date().toISOString(), source: 'LFTG Platform' } });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <Webhook className="w-7 h-7 text-indigo-600" />
            Webhooks
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Notifications HTTP vers des systèmes externes</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-foreground mb-4">Nouveau webhook</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 dark:border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Système partenaire" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                className="w-full border border-gray-200 dark:border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..." />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Événements déclencheurs</label>
            <div className="flex flex-wrap gap-2">
              {WEBHOOK_EVENTS.map(event => (
                <button key={event} onClick={() => handleToggleEvent(event)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.events.includes(event) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 dark:text-gray-400 border-gray-200 dark:border-border hover:border-indigo-300'}`}>
                  {event}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddWebhook} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Ajouter</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 text-sm">Annuler</button>
          </div>
        </div>
      )}

      {/* Liste webhooks */}
      <div className="space-y-3">
        {webhooks.map(wh => (
          <div key={wh.id} className="bg-white dark:bg-card rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${wh.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{wh.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {wh.url}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {wh.events.map(e => (
                    <span key={e} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">{e}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => { setTestUrl(wh.url); setTestResult(null); }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Tester">
                <Send className="w-4 h-4" />
              </button>
              <button onClick={() => setWebhooks(prev => prev.filter(w => w.id !== wh.id))}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Test manuel */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-600" />
          Test manuel
        </h3>
        <div className="flex gap-3">
          <input value={testUrl} onChange={e => setTestUrl(e.target.value)}
            className="flex-1 border border-gray-200 dark:border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="URL du webhook à tester..." />
          <button onClick={handleTest} disabled={sendMutation.isPending || !testUrl}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm transition-colors">
            {sendMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Envoyer
          </button>
        </div>
        {testResult && (
          <div className={`mt-3 flex items-center gap-2 text-sm ${testResult.ok ? 'text-green-600' : 'text-red-600'}`}>
            {testResult.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
