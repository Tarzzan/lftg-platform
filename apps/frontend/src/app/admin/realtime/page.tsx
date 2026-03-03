'use client';

import { useState, useEffect } from 'react';

function useSimulatedRealtime() {
  const [data, setData] = useState({
    activeVisitors: 23,
    animalsMonitored: 92,
    alertsActive: 3,
    staffOnline: 7,
    temperature: 28.4,
    humidity: 76,
    lastUpdate: new Date().toISOString(),
    events: [
      { id: 1, time: new Date(Date.now() - 30000).toISOString(), type: 'alert', message: 'Température élevée serre reptiles', severity: 'warning' },
      { id: 2, time: new Date(Date.now() - 120000).toISOString(), type: 'visit', message: 'Nouveau visiteur — Groupe scolaire (28 pers.)', severity: 'info' },
      { id: 3, time: new Date(Date.now() - 300000).toISOString(), type: 'animal', message: 'Ara AM-042 : alimentation effectuée', severity: 'success' },
      { id: 4, time: new Date(Date.now() - 600000).toISOString(), type: 'staff', message: 'Marie L. connectée — Soigneurs', severity: 'info' },
      { id: 5, time: new Date(Date.now() - 900000).toISOString(), type: 'gps', message: 'Balise GPS TT-003 : position mise à jour', severity: 'info' },
    ],
    chart: Array.from({ length: 20 }, (_, i) => ({
      t: i,
      visitors: Math.floor(15 + Math.random() * 20),
      temp: 27 + Math.random() * 3,
    })),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        activeVisitors: prev.activeVisitors + Math.floor(Math.random() * 3) - 1,
        temperature: parseFloat((prev.temperature + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        humidity: Math.max(60, Math.min(90, prev.humidity + Math.floor(Math.random() * 3) - 1)),
        lastUpdate: new Date().toISOString(),
        chart: [
          ...prev.chart.slice(1),
          { t: prev.chart[prev.chart.length - 1].t + 1, visitors: Math.floor(15 + Math.random() * 20), temp: 27 + Math.random() * 3 },
        ],
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return data;
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 80}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-full h-12" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `il y a ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m}min`;
  return `il y a ${Math.floor(m / 60)}h`;
}

const eventConfig: Record<string, { icon: string; color: string }> = {
  alert: { icon: '⚠️', color: 'text-amber-600' },
  visit: { icon: '👥', color: 'text-blue-600' },
  animal: { icon: '🐾', color: 'text-green-600' },
  staff: { icon: '👤', color: 'text-purple-600' },
  gps: { icon: '📡', color: 'text-gray-600' },
};

export default function RealtimePage() {
  const data = useSimulatedRealtime();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord temps réel</h1>
          <p className="text-sm text-gray-500 mt-1">Métriques live via WebSocket</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          WebSocket connecté · MAJ {timeAgo(data.lastUpdate)}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Visiteurs actifs', value: data.activeVisitors, icon: '👥', color: 'text-blue-700', bg: 'bg-blue-50', chartData: data.chart.map(c => c.visitors), chartColor: '#3b82f6' },
          { label: 'Animaux surveillés', value: data.animalsMonitored, icon: '🐾', color: 'text-forest-700', bg: 'bg-forest-50', chartData: Array(20).fill(92), chartColor: '#16a34a' },
          { label: 'Alertes actives', value: data.alertsActive, icon: '🔔', color: 'text-red-700', bg: 'bg-red-50', chartData: Array(20).fill(3), chartColor: '#dc2626' },
          { label: 'Staff en ligne', value: data.staffOnline, icon: '👤', color: 'text-purple-700', bg: 'bg-purple-50', chartData: Array(20).fill(7), chartColor: '#9333ea' },
        ].map(kpi => (
          <div key={kpi.label} className={`${kpi.bg} rounded-xl border border-gray-100 p-4`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{kpi.label}</span>
              <span>{kpi.icon}</span>
            </div>
            <div className={`text-3xl font-bold ${kpi.color} mb-2`}>{kpi.value}</div>
            <MiniChart data={kpi.chartData} color={kpi.chartColor} />
          </div>
        ))}
      </div>

      {/* Environment sensors */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">🌡️ Température</h3>
            <span className={`text-sm font-bold ${data.temperature > 32 ? 'text-red-600' : data.temperature > 30 ? 'text-amber-600' : 'text-green-600'}`}>
              {data.temperature}°C
            </span>
          </div>
          <div className="space-y-2">
            {[
              { zone: 'Serre Reptiles', value: data.temperature + 9.6, max: 38 },
              { zone: 'Volière Psittacidés', value: data.temperature, max: 35 },
              { zone: 'Terrarium Amphibiens', value: data.temperature - 2.4, max: 28 },
              { zone: 'Bureau administration', value: data.temperature - 4.4, max: 30 },
            ].map(z => (
              <div key={z.zone}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600">{z.zone}</span>
                  <span className={`font-medium ${z.value > z.max ? 'text-red-600' : 'text-gray-700'}`}>
                    {z.value.toFixed(1)}°C
                    {z.value > z.max && ' ⚠️'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${z.value > z.max ? 'bg-red-500' : z.value > z.max * 0.85 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (z.value / z.max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">💧 Humidité</h3>
            <span className="text-sm font-bold text-blue-600">{data.humidity}%</span>
          </div>
          <div className="space-y-2">
            {[
              { zone: 'Terrarium Amphibiens', value: data.humidity + 14, target: '85-95%' },
              { zone: 'Serre Reptiles', value: data.humidity + 4, target: '75-85%' },
              { zone: 'Volière Psittacidés', value: data.humidity, target: '60-80%' },
              { zone: 'Enclos Tortues', value: data.humidity - 16, target: '50-70%' },
            ].map(z => (
              <div key={z.zone}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600">{z.zone}</span>
                  <span className="font-medium text-gray-700">{z.value}% <span className="text-gray-400">({z.target})</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${z.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">📊 Activité du jour</h3>
          <div className="space-y-3">
            {[
              { label: 'Visiteurs total', value: '127', change: '+12%', up: true },
              { label: 'Repas effectués', value: '3/6', change: '50%', up: null },
              { label: 'Soins réalisés', value: '4', change: '+1', up: true },
              { label: 'Alertes résolues', value: '2/5', change: '-', up: null },
              { label: 'Revenus du jour', value: '890€', change: '+18%', up: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{item.value}</span>
                  {item.up !== null && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.up ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live event feed */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Flux d'événements en direct</h3>
          <div className="flex items-center gap-2 text-xs text-green-600">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {data.events.map(event => {
            const cfg = eventConfig[event.type] || { icon: '●', color: 'text-gray-500' };
            return (
              <div key={event.id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-lg">{cfg.icon}</span>
                <div className="flex-1">
                  <span className={`text-sm ${cfg.color}`}>{event.message}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{timeAgo(event.time)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
