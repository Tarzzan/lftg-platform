'use client';
import { useState } from 'react';

const events = [
  { time: '12:05:32.124', event: 'animal.alert', payload: '{ "animalId": "A042", "type": "HEALTH", "message": "Température anormale détectée" }', source: 'IoT Sensor #12' },
  { time: '12:05:28.891', event: 'iot.reading', payload: '{ "sensorId": "S007", "temperature": 32.4, "humidity": 78 }', source: 'Zone Reptiles' },
  { time: '12:05:25.445', event: 'gps.position', payload: '{ "trackerId": "GPS003", "lat": 4.9224, "lng": -52.3133 }', source: 'Balise GPS Ara' },
  { time: '12:05:20.012', event: 'user.login', payload: '{ "userId": "U001", "email": "admin@lftg.fr", "ip": "192.168.1.10" }', source: 'Auth Service' },
  { time: '12:05:15.678', event: 'nutrition.feeding', payload: '{ "animalId": "A015", "planId": "NP003", "status": "COMPLETED" }', source: 'Nutrition Module' },
];

const channels = [
  { name: 'animal.updates', subscribers: 3, events: 142, status: 'active' },
  { name: 'iot.readings', subscribers: 2, events: 1847, status: 'active' },
  { name: 'gps.positions', subscribers: 1, events: 523, status: 'active' },
  { name: 'alerts.critical', subscribers: 5, events: 12, status: 'active' },
  { name: 'system.logs', subscribers: 1, events: 3241, status: 'active' },
];

export default function WebSocketPage() {
  const [connected, setConnected] = useState(true);
  const [tab, setTab] = useState<'events' | 'channels' | 'test'>('events');
  const [testEvent, setTestEvent] = useState('animal.alert');
  const [testPayload, setTestPayload] = useState('{ "animalId": "A001", "message": "Test event" }');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WebSocket Gateway</h1>
          <p className="text-gray-500 mt-1">Socket.io — Événements temps réel bidirectionnels</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {connected ? 'Connecté' : 'Déconnecté'}
          </div>
          <button
            onClick={() => setConnected(!connected)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${connected ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
          >
            {connected ? 'Déconnecter' : 'Connecter'}
          </button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Connexions actives', value: '12', color: 'text-green-600' },
          { label: 'Événements/min', value: '847', color: 'text-blue-600' },
          { label: 'Canaux actifs', value: '5', color: 'text-purple-600' },
          { label: 'Latence moyenne', value: '4ms', color: 'text-orange-600' },
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
          {(['events', 'channels', 'test'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium ${tab === t ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'events' ? 'Flux d\'événements' : t === 'channels' ? 'Canaux' : 'Tester un événement'}
            </button>
          ))}
        </div>

        {tab === 'events' && (
          <div className="p-4">
            <div className="bg-gray-900 rounded-lg p-4 max-h-[400px] overflow-auto font-mono text-xs space-y-3">
              {events.map((ev, i) => (
                <div key={i} className="border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-gray-500">{ev.time}</span>
                    <span className="text-green-400 font-bold">{ev.event}</span>
                    <span className="text-gray-600 ml-auto">{ev.source}</span>
                  </div>
                  <pre className="text-gray-300 text-xs overflow-x-auto">{ev.payload}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'channels' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Canal', 'Abonnés', 'Événements total', 'Statut'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {channels.map((ch) => (
                  <tr key={ch.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-green-700">{ch.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{ch.subscribers}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{ch.events.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">● {ch.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'test' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'événement</label>
              <input
                value={testEvent}
                onChange={(e) => setTestEvent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payload JSON</label>
              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
              ▶ Émettre l'événement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
