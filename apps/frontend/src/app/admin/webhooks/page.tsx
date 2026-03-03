'use client';
import { useState } from 'react';

const webhooks = [
  { id: 'WH001', name: 'DRAAF Guyane', url: 'https://api.draaf.guyane.fr/webhook/lftg', events: ['animal.born', 'animal.died', 'cites.updated'], status: 'active', lastCall: 'Il y a 3h', success: 142, errors: 2 },
  { id: 'WH002', name: 'Clinique Vétérinaire Cayenne', url: 'https://api.clinique-cayenne.fr/hooks', events: ['medical.created', 'medical.updated'], status: 'active', lastCall: 'Il y a 1j', success: 87, errors: 0 },
  { id: 'WH003', name: 'Système Partenaire GBIF', url: 'https://hooks.gbif.org/lftg-updates', events: ['animal.born', 'species.updated'], status: 'active', lastCall: 'Il y a 6h', success: 234, errors: 5 },
  { id: 'WH004', name: 'Système Comptable', url: 'https://erp.lftg.fr/api/webhook', events: ['sale.created', 'payment.received'], status: 'inactive', lastCall: 'Il y a 5j', success: 56, errors: 1 },
];

const logs = [
  { time: '12:03:45', webhook: 'DRAAF Guyane', event: 'animal.born', status: 200, duration: '124ms' },
  { time: '11:47:12', webhook: 'Clinique Vétérinaire', event: 'medical.created', status: 200, duration: '89ms' },
  { time: '10:22:31', webhook: 'GBIF', event: 'animal.born', status: 200, duration: '312ms' },
  { time: '09:15:08', webhook: 'DRAAF Guyane', event: 'cites.updated', status: 500, duration: '5001ms' },
  { time: '08:00:00', webhook: 'Système Comptable', event: 'sale.created', status: 200, duration: '201ms' },
];

export default function WebhooksPage() {
  const [tab, setTab] = useState<'list' | 'logs' | 'create'>('list');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhooks Système</h1>
          <p className="text-gray-500 mt-1">Intégrations sortantes vers systèmes tiers</p>
        </div>
        <button onClick={() => setTab('create')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Nouveau webhook
        </button>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Webhooks actifs', value: '3', color: 'text-blue-600' },
          { label: 'Appels (24h)', value: '47', color: 'text-green-600' },
          { label: 'Taux de succès', value: '97.4%', color: 'text-purple-600' },
          { label: 'Latence moyenne', value: '182ms', color: 'text-orange-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['list', 'logs', 'create'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium ${tab === t ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'list' ? 'Webhooks' : t === 'logs' ? 'Journaux' : 'Créer'}
            </button>
          ))}
        </div>

        {tab === 'list' && (
          <div className="divide-y divide-gray-100">
            {webhooks.map((w) => (
              <div key={w.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{w.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${w.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        ● {w.status}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-gray-500 mt-0.5">{w.url}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {w.events.map((e) => (
                        <span key={e} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">{e}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-500">Dernier appel : {w.lastCall}</p>
                    <p className="text-green-600 font-medium">{w.success} succès</p>
                    {w.errors > 0 && <p className="text-red-500">{w.errors} erreurs</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'logs' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Heure', 'Webhook', 'Événement', 'Statut HTTP', 'Durée'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((l, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">{l.time}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{l.webhook}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{l.event}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${l.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{l.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'create' && (
          <div className="p-6 space-y-4 max-w-lg">
            <h3 className="font-semibold text-gray-900">Nouveau webhook</h3>
            {[
              { label: 'Nom', placeholder: 'Ex: DRAAF Guyane' },
              { label: 'URL de destination', placeholder: 'https://api.exemple.fr/webhook' },
              { label: 'Secret de signature', placeholder: 'Clé secrète HMAC-SHA256' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input placeholder={f.placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Événements déclencheurs</label>
              <div className="grid grid-cols-2 gap-2">
                {['animal.born', 'animal.died', 'medical.created', 'sale.created', 'cites.updated', 'alert.triggered'].map((e) => (
                  <label key={e} className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="rounded" />
                    <span className="font-mono text-xs">{e}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              Créer le webhook
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
