'use client';
import { useState } from 'react';

const endpoints = [
  { method: 'GET', path: '/api/v2/species', desc: 'Liste des espèces hébergées', auth: false, calls: 1842, latency: '45ms' },
  { method: 'GET', path: '/api/v2/animals', desc: 'Inventaire des animaux (filtrable)', auth: true, calls: 3241, latency: '62ms' },
  { method: 'GET', path: '/api/v2/animals/:id', desc: 'Détail d\'un animal', auth: true, calls: 892, latency: '38ms' },
  { method: 'GET', path: '/api/v2/observations', desc: 'Observations terrain', auth: false, calls: 654, latency: '55ms' },
  { method: 'POST', path: '/api/v2/observations', desc: 'Soumettre une observation', auth: true, calls: 127, latency: '120ms' },
  { method: 'GET', path: '/api/v2/cites/status', desc: 'Statuts CITES des espèces', auth: false, calls: 2103, latency: '41ms' },
  { method: 'GET', path: '/api/v2/conservation', desc: 'Données conservation UICN', auth: false, calls: 1567, latency: '78ms' },
  { method: 'POST', path: '/api/v2/webhooks', desc: 'Enregistrer un webhook', auth: true, calls: 23, latency: '95ms' },
  { method: 'GET', path: '/api/v2/stats/public', desc: 'Statistiques publiques', auth: false, calls: 4521, latency: '33ms' },
  { method: 'GET', path: '/api/v2/visits/availability', desc: 'Disponibilités visites', auth: false, calls: 2876, latency: '52ms' },
];

const partners = [
  { name: 'Université de Guyane', key: 'UG-2024-***', calls: 4521, quota: 10000, status: 'active', since: 'Jan 2024' },
  { name: 'CNRS Biodiversité', key: 'CNRS-***', calls: 3241, quota: 50000, status: 'active', since: 'Mar 2024' },
  { name: 'WWF France', key: 'WWF-***', calls: 1842, quota: 5000, status: 'active', since: 'Jun 2024' },
  { name: 'iNaturalist', key: 'INAT-***', calls: 892, quota: 100000, status: 'active', since: 'Sep 2024' },
  { name: 'Parc Amazonien', key: 'PAG-***', calls: 127, quota: 2000, status: 'limited', since: 'Nov 2024' },
];

const webhooks = [
  { event: 'animal.birth', url: 'https://api.wwf.fr/lftg/births', status: 'active', lastTriggered: 'il y a 3j' },
  { event: 'animal.death', url: 'https://api.cnrs.fr/biodiv/deaths', status: 'active', lastTriggered: 'il y a 12j' },
  { event: 'cites.alert', url: 'https://webhook.site/cites-alerts', status: 'active', lastTriggered: 'il y a 2h' },
  { event: 'observation.new', url: 'https://api.inaturalist.org/lftg', status: 'inactive', lastTriggered: 'jamais' },
];

export default function ApiV2Page() {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'partners' | 'webhooks' | 'playground'>('endpoints');
  const [playgroundMethod, setPlaygroundMethod] = useState('GET');
  const [playgroundPath, setPlaygroundPath] = useState('/api/v2/species');
  const [playgroundResponse, setPlaygroundResponse] = useState('');

  const methodColor = (m: string) => {
    if (m === 'GET') return 'bg-blue-100 text-blue-700';
    if (m === 'POST') return 'bg-green-100 text-green-700';
    if (m === 'PUT') return 'bg-yellow-100 text-yellow-700';
    if (m === 'DELETE') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handlePlayground = () => {
    const mockResponse = {
      status: 200,
      data: [
        { id: 1, taxon: 'Ara macao', commonName: 'Ara rouge', citesAppendix: 'I', count: 24 },
        { id: 2, taxon: 'Dendrobates azureus', commonName: 'Dendrobate azuré', citesAppendix: 'II', count: 48 },
      ],
      meta: { total: 28, page: 1, perPage: 20 },
    };
    setPlaygroundResponse(JSON.stringify(mockResponse, null, 2));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Publique v2</h1>
          <p className="text-gray-500 text-sm mt-1">Documentation, partenaires, webhooks et playground interactif</p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            ● API v2.0 — Opérationnelle
          </span>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
            + Nouvelle clé API
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Endpoints', value: endpoints.length, icon: '🔗', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Partenaires actifs', value: partners.filter(p => p.status === 'active').length, icon: '🤝', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Appels ce mois', value: endpoints.reduce((acc, e) => acc + e.calls, 0).toLocaleString(), icon: '📊', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Webhooks actifs', value: webhooks.filter(w => w.status === 'active').length, icon: '🔔', color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} rounded-xl p-4 border border-gray-100`}>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <span>{kpi.icon}</span>{kpi.label}
            </div>
            <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { key: 'endpoints', label: '📋 Endpoints' },
          { key: 'partners', label: '🤝 Partenaires' },
          { key: 'webhooks', label: '🔔 Webhooks' },
          { key: 'playground', label: '🧪 Playground' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Base URL : <code className="bg-gray-200 px-2 py-0.5 rounded text-blue-700">https://api.lftg.fr</code></span>
            <span className="text-xs text-gray-500">Version : v2.0.0 · OpenAPI 3.1</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Méthode', 'Endpoint', 'Description', 'Auth', 'Appels/mois', 'Latence'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {endpoints.map((e, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${methodColor(e.method)}`}>{e.method}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{e.path}</td>
                  <td className="px-4 py-3 text-gray-600">{e.desc}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${e.auth ? 'text-orange-600' : 'text-green-600'}`}>
                      {e.auth ? '🔒 Requis' : '🔓 Public'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{e.calls.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{e.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <div className="space-y-3">
          {partners.map((p) => (
            <div key={p.name} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Clé API : <code className="bg-gray-100 px-1 rounded">{p.key}</code> · Depuis {p.since}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {p.status === 'active' ? '● Actif' : '⚠ Limité'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${(p.calls / p.quota) > 0.8 ? 'bg-red-500' : (p.calls / p.quota) > 0.5 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((p.calls / p.quota) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-32 text-right">{p.calls.toLocaleString()} / {p.quota.toLocaleString()} appels</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-3">
          {webhooks.map((w, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{w.event}</span>
                  <span className={`w-2 h-2 rounded-full ${w.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-mono">{w.url}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${w.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {w.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
                <p className="text-xs text-gray-400 mt-1">Dernier déclenchement : {w.lastTriggered}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Playground Tab */}
      {activeTab === 'playground' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Requête</h3>
            <div className="flex gap-2">
              <select
                value={playgroundMethod}
                onChange={e => setPlaygroundMethod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
              >
                {['GET', 'POST', 'PUT', 'DELETE'].map(m => <option key={m}>{m}</option>)}
              </select>
              <input
                type="text"
                value={playgroundPath}
                onChange={e => setPlaygroundPath(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="/api/v2/..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Headers</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-1 font-mono text-xs text-gray-600">
                <div>Authorization: Bearer {'<votre-clé-api>'}</div>
                <div>Content-Type: application/json</div>
                <div>Accept: application/json</div>
              </div>
            </div>
            <button
              onClick={handlePlayground}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              ▶ Envoyer la requête
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Réponse</h3>
            {playgroundResponse ? (
              <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-auto max-h-80 font-mono">
                {playgroundResponse}
              </pre>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                <div className="text-3xl mb-2">🧪</div>
                <p className="text-sm">Envoyez une requête pour voir la réponse</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
