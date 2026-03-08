'use client';
import { useState, useEffect, useRef } from 'react';
import { notificationsApi } from '@/lib/api';

interface SSEEvent {
  id: string;
  time: string;
  type: string;
  data: string;
  source: string;
}

const CHANNELS = [
  { name: 'notifications/stream', description: 'Flux SSE personnel', status: 'active' },
  { name: 'notifications/stream/global', description: 'Flux SSE global (admin)', status: 'active' },
  { name: 'animal.updates', description: 'Mises à jour animaux', status: 'active' },
  { name: 'iot.readings', description: 'Lectures capteurs IoT', status: 'active' },
  { name: 'alerts.critical', description: 'Alertes critiques', status: 'active' },
];

export default function WebSocketPage() {
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState<'events' | 'channels' | 'test'>('events');
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [testEvent, setTestEvent] = useState('animal.alert');
  const [testPayload, setTestPayload] = useState('{ "animalId": "A001", "message": "Test event" }');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setConnectionStatus('connecting');
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    const url = `${notificationsApi.streamUrl()}${token ? `?token=${token}` : ''}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setConnectionStatus('connected');
      setEvents((prev) => [{
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('fr-FR', { hour12: false }),
        type: 'system.connect',
        data: '{ "message": "Connexion SSE établie" }',
        source: 'Système',
      }, ...prev].slice(0, 50));
    };

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((prev) => [{
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString('fr-FR', { hour12: false }),
          type: data.type ?? 'message',
          data: e.data,
          source: data.source ?? 'Backend',
        }, ...prev].slice(0, 50));
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setConnected(false);
      setConnectionStatus('error');
      es.close();
      eventSourceRef.current = null;
    };
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnected(false);
    setConnectionStatus('idle');
    setEvents((prev) => [{
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('fr-FR', { hour12: false }),
      type: 'system.disconnect',
      data: '{ "message": "Déconnexion SSE" }',
      source: 'Système',
    }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const statusBadge = {
    idle: 'bg-gray-100 text-gray-600',
    connecting: 'bg-yellow-100 text-yellow-800',
    connected: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  }[connectionStatus];

  const statusLabel = {
    idle: 'Déconnecté',
    connecting: 'Connexion...',
    connected: 'Connecté (SSE)',
    error: 'Erreur de connexion',
  }[connectionStatus];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications SSE</h1>
          <p className="text-gray-500 text-sm mt-1">Server-Sent Events — Flux temps réel de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge}`}>
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'}`} />
            {statusLabel}
          </div>
          <button
            onClick={connected ? disconnect : connect}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${connected ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            {connected ? 'Déconnecter' : 'Connecter au flux SSE'}
          </button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Événements reçus', value: events.length, color: 'text-green-600' },
          { label: 'Canaux disponibles', value: CHANNELS.length, color: 'text-blue-600' },
          { label: 'Statut SSE', value: connectionStatus === 'connected' ? 'Actif' : 'Inactif', color: connectionStatus === 'connected' ? 'text-green-600' : 'text-gray-500' },
          { label: 'Protocole', value: 'SSE/HTTP', color: 'text-purple-600' },
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
              {t === 'events' ? `Flux d'événements (${events.length})` : t === 'channels' ? 'Canaux' : 'Tester'}
            </button>
          ))}
        </div>

        {tab === 'events' && (
          <div className="p-4">
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">📡</p>
                <p className="font-medium text-gray-600">Aucun événement reçu</p>
                <p className="text-sm mt-1">Connectez-vous au flux SSE pour recevoir les événements en temps réel</p>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg p-4 max-h-[400px] overflow-auto font-mono text-xs space-y-3">
                {events.map((ev) => (
                  <div key={ev.id} className="border-b border-gray-800 pb-3">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-gray-500">{ev.time}</span>
                      <span className="text-green-400 font-bold">{ev.type}</span>
                      <span className="text-gray-600 ml-auto">{ev.source}</span>
                    </div>
                    <pre className="text-gray-300 text-xs overflow-x-auto">{ev.data}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'channels' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Endpoint SSE', 'Description', 'Statut'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {CHANNELS.map((ch) => (
                  <tr key={ch.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-green-700">/api/v1/{ch.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ch.description}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        ● {ch.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'test' && (
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">ℹ️ Test SSE</p>
              <p>Connectez-vous au flux SSE ci-dessus pour voir les événements en temps réel. Les événements sont émis automatiquement par le backend lors d&apos;actions sur la plateforme.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL du flux SSE</label>
              <input
                readOnly
                value={`/api/v1/notifications/stream`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exemple de payload reçu</label>
              <textarea
                readOnly
                value={`{"id":"evt_001","type":"animal.alert","data":{"animalId":"A001","message":"Température anormale"},"timestamp":"${new Date().toISOString()}"}`}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
              />
            </div>
            <button
              onClick={connected ? disconnect : connect}
              className={`px-6 py-2 rounded-lg text-sm font-medium ${connected ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              {connected ? '⏹ Arrêter le flux' : '▶ Démarrer le flux SSE'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
