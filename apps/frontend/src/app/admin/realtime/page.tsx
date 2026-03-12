'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface RealtimeMetric {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: string;
  delta?: number;
  timestamp?: string;
  category?: string;
}

interface RealtimeEvent {
  id?: string;
  type: string;
  message: string;
  severity?: string;
  timestamp: string;
  source?: string;
}

interface EnvironmentData {
  temperature?: number;
  humidity?: number;
  co2?: number;
  lightLevel?: number;
  waterTemp?: number;
  ph?: number;
  timestamp?: string;
}

export default function RealtimePage() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'events' | 'environment'>('metrics');

  const { data: metrics = [], isLoading: loadingMetrics, isError }
  = useQuery<RealtimeMetric[]>({
    queryKey: ['realtime-metrics'],
    queryFn: async () => {
      const res = await api.get('/realtime/metrics');
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 30000,
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery<RealtimeEvent[]>({
    queryKey: ['realtime-events'],
    queryFn: async () => {
      const res = await api.get('/realtime/events');
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 15000,
  });

  const { data: environment, isLoading: loadingEnv } = useQuery<EnvironmentData>({
    queryKey: ['realtime-environment'],
    queryFn: async () => {
      const res = await api.get('/realtime/environment');
      return res.data;
    },
    refetchInterval: 60000,
  });

  const trendIcon = (trend?: string) => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const trendColor = (trend?: string) => {
    if (trend === 'up') return 'text-red-400';
    if (trend === 'down') return 'text-green-400';
    return 'text-slate-400';
  };

  const severityConfig: Record<string, { color: string; bg: string }> = {
    critical: { color: 'text-red-400', bg: 'bg-red-900/30' },
    warning: { color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
    info: { color: 'text-blue-400', bg: 'bg-blue-900/30' },
    success: { color: 'text-green-400', bg: 'bg-green-900/30' },
  };

  const categoryColors: Record<string, string> = {
    animals: 'text-green-400',
    health: 'text-red-400',
    environment: 'text-cyan-400',
    operations: 'text-yellow-400',
    system: 'text-purple-400',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tableau de bord temps réel</h1>
          <p className="text-slate-400 mt-1">Métriques et événements en direct — actualisation automatique</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-semibold">En direct</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {[
          { id: 'metrics', label: 'Métriques', count: metrics.length },
          { id: 'events', label: 'Événements', count: events.length },
          { id: 'environment', label: '️ Environnement', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors ${activeTab === tab.id ? 'bg-slate-800 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="ml-2 bg-slate-700 text-slate-300 text-xs px-1.5 py-0.5 rounded">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Métriques */}
      {activeTab === 'metrics' && (
        <div>
          {loadingMetrics ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {metrics.map((m, i) => (
                <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <p className={`text-xs font-semibold mb-1 ${categoryColors[m.category || ''] || 'text-slate-400'}`}>
                    {m.category?.toUpperCase() || 'GÉNÉRAL'}
                  </p>
                  <p className="text-slate-300 text-sm">{m.label}</p>
                  <div className="flex items-end gap-2 mt-1">
                    <p className="text-2xl font-bold text-white">{m.value}{m.unit}</p>
                    {m.trend && (
                      <span className={`text-sm font-bold ${trendColor(m.trend)}`}>
                        {trendIcon(m.trend)} {m.delta !== undefined && m.delta !== 0 ? Math.abs(m.delta) : ''}
                      </span>
                    )}
                  </div>
                  {m.timestamp && (
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(m.timestamp).toLocaleTimeString('fr-FR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Événements */}
      {activeTab === 'events' && (
        <div>
          {loadingEvents ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : events.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
              <p className="text-4xl mb-3"></p>
              <p className="text-slate-300">Aucun événement récent</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event, i) => {
                const sCfg = severityConfig[event.severity?.toLowerCase() || 'info'] || severityConfig.info;
                return (
                  <div key={i} className={`rounded-lg p-3 border border-slate-700 ${sCfg.bg}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase ${sCfg.color}`}>{event.type}</span>
                          {event.source && <span className="text-slate-500 text-xs">via {event.source}</span>}
                        </div>
                        <p className="text-white text-sm mt-0.5">{event.message}</p>
                      </div>
                      <span className="text-slate-400 text-xs whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Environnement */}
      {activeTab === 'environment' && (
        <div>
          {loadingEnv ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : !environment ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
              <p className="text-4xl mb-3">️</p>
              <p className="text-slate-300">Données environnementales non disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {environment.temperature !== undefined && (
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <p className="text-slate-400 text-sm">️ Température</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{environment.temperature}°C</p>
                </div>
              )}
              {environment.humidity !== undefined && (
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <p className="text-slate-400 text-sm">Humidité</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{environment.humidity}%</p>
                </div>
              )}
              {environment.co2 !== undefined && (
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <p className="text-slate-400 text-sm">️ CO₂</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{environment.co2} ppm</p>
                </div>
              )}
              {environment.lightLevel !== undefined && (
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <p className="text-slate-400 text-sm">️ Luminosité</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">{environment.lightLevel} lux</p>
                </div>
              )}
              {environment.waterTemp !== undefined && (
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <p className="text-slate-400 text-sm">Temp. eau</p>
                  <p className="text-3xl font-bold text-cyan-400 mt-2">{environment.waterTemp}°C</p>
                </div>
              )}
              {environment.ph !== undefined && (
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <p className="text-slate-400 text-sm">️ pH</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">{environment.ph}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
