'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, RefreshCw, CheckCircle, Code } from 'lucide-react';
import { api } from '@/lib/api';

export default function ApiV2Page() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', scopes: [] as string[], expiresIn: '365' });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);

  const SCOPES = ['animals:read', 'animals:write', 'medical:read', 'medical:write', 'stock:read', 'stock:write', 'cites:read', 'analytics:read', 'webhooks:write'];

  const { data: keys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.get('/public/v2/api-keys').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/public/v2/api-keys', data).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['api-keys'] });
      setNewKey(data.key ?? data.apiKey ?? data.token ?? null);
      setShowForm(false);
      setForm({ name: '', scopes: [], expiresIn: '365' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/public/v2/api-keys/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleScope = (scope: string) => {
    setForm(f => ({ ...f, scopes: f.scopes.includes(scope) ? f.scopes.filter(s => s !== scope) : [...f.scopes, scope] }));
  };

  const keyList: any[] = Array.isArray(keys) ? keys : (keys?.data ?? []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Key className="w-7 h-7 text-indigo-600" />
            API v2 — Clés d'accès
          </h1>
          <p className="text-gray-500 mt-1">Gestion des clés API pour l'accès programmatique</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nouvelle clé
        </button>
      </div>

      {/* Nouvelle clé générée */}
      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="font-medium text-green-900">Clé API créée — Copiez-la maintenant, elle ne sera plus visible</p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-green-200 px-3 py-2">
            <code className="flex-1 text-sm font-mono text-gray-800 break-all">{newKey}</code>
            <button onClick={() => handleCopy(newKey, 'new')} className="flex-shrink-0 p-1.5 text-green-600 hover:bg-green-100 rounded">
              {copiedId === 'new' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="mt-2 text-xs text-green-700 hover:underline">J'ai copié ma clé</button>
        </div>
      )}

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Nouvelle clé API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la clé</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Application mobile, Intégration GBIF" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration (jours)</label>
              <select value={form.expiresIn} onChange={e => setForm(f => ({ ...f, expiresIn: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="30">30 jours</option>
                <option value="90">90 jours</option>
                <option value="365">1 an</option>
                <option value="0">Jamais</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions (scopes)</label>
            <div className="flex flex-wrap gap-2">
              {SCOPES.map(scope => (
                <button key={scope} onClick={() => toggleScope(scope)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.scopes.includes(scope) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                  {scope}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.name}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
              {createMutation.isPending ? 'Génération...' : 'Générer la clé'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Annuler</button>
          </div>
        </div>
      )}

      {/* Liste des clés */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement...</div>
      ) : keyList.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune clé API</p>
          <p className="text-sm mt-1">Créez une clé pour accéder à l'API LFTG</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keyList.map((k: any) => (
            <div key={k.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                    <Key className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{k.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs font-mono text-gray-500">
                        {visibleKeys.has(k.id) ? (k.key ?? k.apiKey ?? k.token ?? '***') : `${(k.key ?? k.apiKey ?? k.token ?? '').slice(0, 8)}${'•'.repeat(24)}`}
                      </code>
                      <button onClick={() => setVisibleKeys(prev => { const s = new Set(prev); s.has(k.id) ? s.delete(k.id) : s.add(k.id); return s; })}
                        className="text-gray-400 hover:text-gray-600">
                        {visibleKeys.has(k.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button onClick={() => handleCopy(k.key ?? k.apiKey ?? k.token ?? '', k.id)}
                        className="text-gray-400 hover:text-gray-600">
                        {copiedId === k.id ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(k.scopes ?? []).map((s: string) => (
                        <span key={s} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {k.expiresAt && (
                    <span className={`text-xs ${new Date(k.expiresAt) < new Date() ? 'text-red-600' : 'text-gray-500'}`}>
                      Exp: {new Date(k.expiresAt).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  <button onClick={() => deleteMutation.mutate(k.id)} disabled={deleteMutation.isPending}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documentation */}
      <div className="bg-gray-900 rounded-xl p-5 text-white">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Code className="w-4 h-4" />Utilisation de l'API</h3>
        <pre className="text-sm text-gray-300 overflow-x-auto">{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://lftg.fr/api/v2/animals

# Réponse JSON
{ "data": [...], "total": 42, "page": 1 }`}</pre>
      </div>
    </div>
  );
}
