'use client';
import { useState } from 'react';

const sensors = [
  { id: 'S-TEMP-01', zone: 'Serre Reptiles', type: 'Température', value: 38.2, unit: '°C', min: 28, max: 35, status: 'critical', battery: 92, lastUpdate: 'il y a 12s' },
  { id: 'S-HUM-01', zone: 'Serre Reptiles', type: 'Humidité', value: 82, unit: '%', min: 75, max: 85, status: 'ok', battery: 87, lastUpdate: 'il y a 12s' },
  { id: 'S-CO2-01', zone: 'Serre Reptiles', type: 'CO₂', value: 450, unit: 'ppm', min: 300, max: 600, status: 'ok', battery: 78, lastUpdate: 'il y a 12s' },
  { id: 'S-TEMP-02', zone: 'Volière Psittacidés', type: 'Température', value: 28.4, unit: '°C', min: 22, max: 32, status: 'ok', battery: 65, lastUpdate: 'il y a 8s' },
  { id: 'S-HUM-02', zone: 'Volière Psittacidés', type: 'Humidité', value: 76, unit: '%', min: 60, max: 80, status: 'ok', battery: 61, lastUpdate: 'il y a 8s' },
  { id: 'S-TEMP-03', zone: 'Terrarium Amphibiens', type: 'Température', value: 26.1, unit: '°C', min: 24, max: 28, status: 'ok', battery: 44, lastUpdate: 'il y a 5s' },
  { id: 'S-HUM-03', zone: 'Terrarium Amphibiens', type: 'Humidité', value: 91, unit: '%', min: 85, max: 95, status: 'ok', battery: 39, lastUpdate: 'il y a 5s' },
  { id: 'S-CO2-02', zone: 'Terrarium Amphibiens', type: 'CO₂', value: 520, unit: 'ppm', min: 300, max: 600, status: 'ok', battery: 55, lastUpdate: 'il y a 5s' },
  { id: 'S-TEMP-04', zone: 'Enclos Tortues', type: 'Température', value: 31.5, unit: '°C', min: 28, max: 34, status: 'ok', battery: 88, lastUpdate: 'il y a 20s' },
  { id: 'S-HUM-04', zone: 'Enclos Tortues', type: 'Humidité', value: 58, unit: '%', min: 50, max: 70, status: 'ok', battery: 72, lastUpdate: 'il y a 20s' },
  { id: 'S-TEMP-05', zone: 'Bureau Administration', type: 'Température', value: 24.0, unit: '°C', min: 18, max: 26, status: 'ok', battery: 95, lastUpdate: 'il y a 3s' },
  { id: 'S-BATT-01', zone: 'Volière Amazones', type: 'Humidité', value: 68, unit: '%', min: 55, max: 75, status: 'warning', battery: 18, lastUpdate: 'il y a 2min' },
];

const history = [
  { time: '10:00', temp: 37.1, hum: 81 },
  { time: '10:15', temp: 37.4, hum: 82 },
  { time: '10:30', temp: 37.8, hum: 81 },
  { time: '10:45', temp: 38.0, hum: 83 },
  { time: '11:00', temp: 38.2, hum: 82 },
  { time: '11:15', temp: 37.9, hum: 82 },
];

const mqttEvents = [
  { time: 'il y a 12s', topic: 'lftg/serre-reptiles/temp/data', payload: '{"value":38.2,"unit":"°C"}', type: 'alert' },
  { time: 'il y a 8s', topic: 'lftg/voliere-psittacides/temp/data', payload: '{"value":28.4,"unit":"°C"}', type: 'info' },
  { time: 'il y a 5s', topic: 'lftg/terrarium-amphibiens/hum/data', payload: '{"value":91,"unit":"%"}', type: 'info' },
  { time: 'il y a 20s', topic: 'lftg/enclos-tortues/temp/data', payload: '{"value":31.5,"unit":"°C"}', type: 'info' },
  { time: 'il y a 2min', topic: 'lftg/voliere-amazones/battery/low', payload: '{"level":18}', type: 'warning' },
  { time: 'il y a 5min', topic: 'lftg/serre-reptiles/co2/data', payload: '{"value":450,"unit":"ppm"}', type: 'info' },
];

const zones = ['Toutes les zones', 'Serre Reptiles', 'Volière Psittacidés', 'Terrarium Amphibiens', 'Enclos Tortues', 'Bureau Administration', 'Volière Amazones'];

export default function IotPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sensors' | 'mqtt'>('dashboard');
  const [selectedZone, setSelectedZone] = useState('Toutes les zones');

  const criticalCount = sensors.filter(s => s.status === 'critical').length;
  const warningCount = sensors.filter(s => s.status === 'warning').length;
  const lowBatteryCount = sensors.filter(s => s.battery < 20).length;
  const filteredSensors = selectedZone === 'Toutes les zones' ? sensors : sensors.filter(s => s.zone === selectedZone);

  const statusColor = (status: string) => {
    if (status === 'critical') return 'text-red-600 bg-red-50 border-red-200';
    if (status === 'warning') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const statusLabel = (status: string) => {
    if (status === 'critical') return '🔴 Critique';
    if (status === 'warning') return '🟡 Avertissement';
    return '🟢 Normal';
  };

  const batteryColor = (level: number) => {
    if (level < 20) return 'bg-red-500';
    if (level < 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const eventColor = (type: string) => {
    if (type === 'alert') return 'border-l-4 border-red-400 bg-red-50';
    if (type === 'warning') return 'border-l-4 border-yellow-400 bg-yellow-50';
    return 'border-l-4 border-blue-400 bg-blue-50';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IoT & Capteurs MQTT</h1>
          <p className="text-gray-500 text-sm mt-1">Surveillance environnementale temps réel</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            MQTT connecté · broker.mosquitto.org
          </span>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
            + Ajouter capteur
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Capteurs actifs', value: sensors.length, icon: '📡', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Alertes critiques', value: criticalCount, icon: '🔴', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Avertissements', value: warningCount, icon: '🟡', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Batterie faible', value: lowBatteryCount, icon: '🔋', color: 'text-orange-600', bg: 'bg-orange-50' },
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
          { key: 'dashboard', label: '📊 Dashboard' },
          { key: 'sensors', label: '📡 Capteurs' },
          { key: 'mqtt', label: '⚡ Flux MQTT' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-green-600 text-green-700 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Zone cards */}
          {['Serre Reptiles', 'Volière Psittacidés', 'Terrarium Amphibiens', 'Enclos Tortues', 'Bureau Administration', 'Volière Amazones'].map((zone) => {
            const zoneSensors = sensors.filter(s => s.zone === zone);
            const hasAlert = zoneSensors.some(s => s.status === 'critical');
            const hasWarning = zoneSensors.some(s => s.status === 'warning');
            return (
              <div key={zone} className={`rounded-xl border p-4 ${hasAlert ? 'border-red-200 bg-red-50' : hasWarning ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm">{zone}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${hasAlert ? 'bg-red-100 text-red-600' : hasWarning ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                    {hasAlert ? '🔴 Alerte' : hasWarning ? '🟡 Attention' : '🟢 Normal'}
                  </span>
                </div>
                <div className="space-y-2">
                  {zoneSensors.map((s) => (
                    <div key={s.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{s.type}</span>
                      <span className={`font-bold ${s.status === 'critical' ? 'text-red-600' : s.status === 'warning' ? 'text-yellow-600' : 'text-gray-800'}`}>
                        {s.value}{s.unit}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                  <span>{zoneSensors.length} capteur{zoneSensors.length > 1 ? 's' : ''}</span>
                  <span>MAJ {zoneSensors[0]?.lastUpdate}</span>
                </div>
              </div>
            );
          })}

          {/* Historique graphique */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">📈 Historique — Serre Reptiles (dernière heure)</h3>
            <div className="flex items-end gap-2 h-32">
              {history.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <div
                      className="w-full bg-red-400 rounded-t"
                      style={{ height: `${(h.temp - 35) * 20}px`, minHeight: '4px' }}
                      title={`Temp: ${h.temp}°C`}
                    ></div>
                    <div
                      className="w-full bg-blue-400 rounded-t"
                      style={{ height: `${(h.hum - 78) * 8}px`, minHeight: '4px' }}
                      title={`Hum: ${h.hum}%`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400">{h.time}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded"></span>Température (°C)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded"></span>Humidité (%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Sensors Tab */}
      {activeTab === 'sensors' && (
        <div>
          <div className="flex gap-2 mb-4">
            {zones.map((z) => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedZone === z ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {z}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['ID', 'Zone', 'Type', 'Valeur', 'Plage normale', 'Statut', 'Batterie', 'Dernière MAJ'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSensors.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.zone}</td>
                    <td className="px-4 py-3 text-gray-600">{s.type}</td>
                    <td className={`px-4 py-3 font-bold ${s.status === 'critical' ? 'text-red-600' : s.status === 'warning' ? 'text-yellow-600' : 'text-gray-800'}`}>
                      {s.value}{s.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.min}–{s.max}{s.unit}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor(s.status)}`}>
                        {statusLabel(s.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${batteryColor(s.battery)}`} style={{ width: `${s.battery}%` }}></div>
                        </div>
                        <span className={`text-xs ${s.battery < 20 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>{s.battery}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{s.lastUpdate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MQTT Tab */}
      {activeTab === 'mqtt' && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-green-400 font-mono text-sm font-bold">MQTT Broker — Flux en direct</h3>
              <span className="text-green-400 text-xs animate-pulse">● LIVE</span>
            </div>
            <div className="space-y-2">
              {mqttEvents.map((e, i) => (
                <div key={i} className={`rounded p-3 ${e.type === 'alert' ? 'bg-red-900/30 border border-red-700' : e.type === 'warning' ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-gray-800'}`}>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-green-300">{e.topic}</span>
                    <span className="text-gray-500 text-xs">{e.time}</span>
                  </div>
                  <div className="font-mono text-xs text-gray-300 mt-1">{e.payload}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Topics souscrits */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Topics MQTT souscrits</h3>
            <div className="space-y-2">
              {[
                { topic: 'lftg/+/temp/data', desc: 'Température toutes zones', count: 5 },
                { topic: 'lftg/+/hum/data', desc: 'Humidité toutes zones', count: 4 },
                { topic: 'lftg/+/co2/data', desc: 'CO₂ toutes zones', count: 2 },
                { topic: 'lftg/+/battery/low', desc: 'Alertes batterie faible', count: 1 },
                { topic: 'lftg/gps/+/position', desc: 'Positions GPS animaux', count: 5 },
              ].map((t) => (
                <div key={t.topic} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="font-mono text-sm text-blue-600">{t.topic}</span>
                    <p className="text-xs text-gray-500">{t.desc}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{t.count} msg/min</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
