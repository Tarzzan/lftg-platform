'use client';
import { useState } from 'react';

const devices = [
  { id: 'D001', name: 'iPhone 15 — admin@lftg.fr', platform: 'iOS', status: 'active', lastSeen: 'Il y a 2 min' },
  { id: 'D002', name: 'Pixel 8 — soigneur@lftg.fr', platform: 'Android', status: 'active', lastSeen: 'Il y a 15 min' },
  { id: 'D003', name: 'iPad Pro — veterinaire@lftg.fr', platform: 'iOS', status: 'active', lastSeen: 'Il y a 1h' },
  { id: 'D004', name: 'Galaxy S24 — gestionnaire@lftg.fr', platform: 'Android', status: 'inactive', lastSeen: 'Il y a 2j' },
];

const history = [
  { time: '12:05', title: 'Alerte critique', body: 'Température anormale — Enclos Reptiles', target: 'Tous', status: 'delivered', count: 4 },
  { time: '11:30', title: 'Rappel soins', body: 'Nourrissage Python réticulé A042 à 12h00', target: 'soigneur@lftg.fr', status: 'delivered', count: 1 },
  { time: '10:15', title: 'Nouveau parrainage', body: 'Léa Martin parraine désormais Kaa', target: 'admin@lftg.fr', status: 'delivered', count: 1 },
  { time: '09:00', title: 'Rapport hebdomadaire', body: 'Votre rapport de la semaine est disponible', target: 'Tous', status: 'delivered', count: 4 },
];

const topics = [
  { name: 'alerts.critical', subscribers: 4, description: 'Alertes critiques (santé, sécurité)' },
  { name: 'alerts.warning', subscribers: 3, description: 'Alertes d\'avertissement' },
  { name: 'feeding.reminders', subscribers: 2, description: 'Rappels de nourrissage' },
  { name: 'reports.weekly', subscribers: 4, description: 'Rapports hebdomadaires' },
  { name: 'sponsorship.news', subscribers: 1, description: 'Nouvelles des parrainages' },
];

export default function PushFcmPage() {
  const [tab, setTab] = useState<'devices' | 'send' | 'history' | 'topics'>('devices');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Push FCM</h1>
          <p className="text-gray-500 mt-1">Firebase Cloud Messaging — iOS & Android</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">Firebase v13</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">4 appareils actifs</span>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Appareils enregistrés', value: '4', color: 'text-blue-600' },
          { label: 'Notifications envoyées (7j)', value: '127', color: 'text-green-600' },
          { label: 'Taux de livraison', value: '99.2%', color: 'text-purple-600' },
          { label: 'Topics actifs', value: '5', color: 'text-orange-600' },
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
          {(['devices', 'send', 'history', 'topics'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium ${tab === t ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'devices' ? 'Appareils' : t === 'send' ? 'Envoyer' : t === 'history' ? 'Historique' : 'Topics'}
            </button>
          ))}
        </div>

        {tab === 'devices' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Appareil', 'Plateforme', 'Statut', 'Dernière activité'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {devices.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${d.platform === 'iOS' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                        {d.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        ● {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{d.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'send' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
              <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="all">Tous les appareils</option>
                <option value="admin">admin@lftg.fr</option>
                <option value="soigneur">soigneur@lftg.fr</option>
                <option value="veterinaire">veterinaire@lftg.fr</option>
                <option value="topic_alerts">Topic: alerts.critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la notification" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Corps de la notification..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
              ▶ Envoyer la notification
            </button>
          </div>
        )}

        {tab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Heure', 'Titre', 'Message', 'Destinataire', 'Appareils', 'Statut'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">{h.time}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{h.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{h.body}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{h.target}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{h.count}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">✓ {h.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'topics' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Topic FCM', 'Abonnés', 'Description'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topics.map((t) => (
                  <tr key={t.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-orange-700">{t.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{t.subscribers}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{t.description}</td>
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
