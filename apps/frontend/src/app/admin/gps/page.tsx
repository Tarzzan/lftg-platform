'use client';

import { useState } from 'react';

const trackedAnimals = [
  {
    id: 'gps-1',
    animalId: 'AM-042',
    name: 'Ara Macao AM-042',
    species: 'Ara macao',
    lat: 4.9372,
    lng: -52.3261,
    battery: 87,
    lastSeen: '2026-03-01T11:45:00Z',
    status: 'active',
    enclosure: 'Volière Psittacidés A',
    speed: 0,
    altitude: 12,
  },
  {
    id: 'gps-2',
    animalId: 'AM-017',
    name: 'Ara Chloropterus AM-017',
    species: 'Ara chloropterus',
    lat: 4.9368,
    lng: -52.3255,
    battery: 23,
    lastSeen: '2026-03-01T11:40:00Z',
    status: 'low_battery',
    enclosure: 'Volière Psittacidés A',
    speed: 0,
    altitude: 8,
  },
  {
    id: 'gps-3',
    animalId: 'TT-003',
    name: 'Tortue Carbonaria TT-003',
    species: 'Geochelone carbonaria',
    lat: 4.9380,
    lng: -52.3270,
    battery: 65,
    lastSeen: '2026-03-01T10:30:00Z',
    status: 'active',
    enclosure: 'Enclos Tortues Ext.',
    speed: 0.2,
    altitude: 2,
  },
  {
    id: 'gps-4',
    animalId: 'BC-001',
    name: 'Boa Constrictor BC-001',
    species: 'Boa constrictor',
    lat: 4.9365,
    lng: -52.3280,
    battery: 91,
    lastSeen: '2026-03-01T09:15:00Z',
    status: 'inactive',
    enclosure: 'Terrarium Serpents',
    speed: 0,
    altitude: 1,
  },
  {
    id: 'gps-5',
    animalId: 'AM-031',
    name: 'Amazone AM-031',
    species: 'Amazona amazonica',
    lat: 4.9375,
    lng: -52.3248,
    battery: 54,
    lastSeen: '2026-03-01T11:50:00Z',
    status: 'active',
    enclosure: 'Volière Amazones',
    speed: 1.2,
    altitude: 15,
  },
];

const enclosureBoundaries = [
  { name: 'Volière Psittacidés A', area: '850 m²', animals: 12, color: '#22c55e' },
  { name: 'Volière Amazones', area: '620 m²', animals: 8, color: '#3b82f6' },
  { name: 'Enclos Tortues Ext.', area: '400 m²', animals: 12, color: '#f59e0b' },
  { name: 'Terrarium Serpents', area: '120 m²', animals: 8, color: '#8b5cf6' },
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: 'Actif', color: 'text-green-700', dot: 'bg-green-500' },
  low_battery: { label: 'Batterie faible', color: 'text-amber-700', dot: 'bg-amber-500' },
  inactive: { label: 'Inactif', color: 'text-gray-500', dot: 'bg-gray-400' },
  out_of_bounds: { label: 'Hors zone', color: 'text-red-700', dot: 'bg-red-500' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h${m}min`;
  return `${m}min`;
}

export default function GpsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<'map' | 'list' | 'enclosures'>('map');

  const selectedAnimal = trackedAnimals.find(a => a.id === selected);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Géolocalisation GPS</h1>
          <p className="text-sm text-gray-500 mt-1">Suivi temps réel des animaux équipés</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Temps réel actif
          </div>
          <button className="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 text-sm font-medium">
            + Ajouter balise
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Balises actives', value: trackedAnimals.filter(a => a.status === 'active').length, icon: '📡', color: 'text-green-700' },
          { label: 'Batterie faible', value: trackedAnimals.filter(a => a.status === 'low_battery').length, icon: '🔋', color: 'text-amber-700' },
          { label: 'Hors zone', value: trackedAnimals.filter(a => a.status === 'out_of_bounds').length, icon: '⚠️', color: 'text-red-700' },
          { label: 'Total balises', value: trackedAnimals.length, icon: '🐾', color: 'text-blue-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['map', 'list', 'enclosures'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'map' ? '🗺️ Carte' : t === 'list' ? '📋 Liste' : '🏠 Enclos'}
          </button>
        ))}
      </div>

      {tab === 'map' && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Map placeholder */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="relative h-96 bg-gradient-to-br from-green-100 to-emerald-200">
              {/* Simulated map */}
              <div className="absolute inset-0 p-4">
                <div className="text-xs text-gray-500 mb-2 font-medium">Ferme Tropicale de Guyane — Vue satellite</div>
                {/* Enclosure zones */}
                <div className="relative w-full h-full">
                  <div className="absolute top-8 left-8 w-48 h-32 border-2 border-green-500 bg-green-500/10 rounded-lg flex items-start p-2">
                    <span className="text-xs font-medium text-green-700">Volière Psittacidés A</span>
                  </div>
                  <div className="absolute top-8 right-8 w-36 h-28 border-2 border-blue-500 bg-blue-500/10 rounded-lg flex items-start p-2">
                    <span className="text-xs font-medium text-blue-700">Volière Amazones</span>
                  </div>
                  <div className="absolute bottom-16 left-8 w-32 h-24 border-2 border-amber-500 bg-amber-500/10 rounded-lg flex items-start p-2">
                    <span className="text-xs font-medium text-amber-700">Enclos Tortues</span>
                  </div>
                  <div className="absolute bottom-16 right-16 w-24 h-20 border-2 border-purple-500 bg-purple-500/10 rounded-lg flex items-start p-2">
                    <span className="text-xs font-medium text-purple-700">Terrarium</span>
                  </div>

                  {/* Animal markers */}
                  {trackedAnimals.map((a, i) => {
                    const positions = [
                      { top: '30%', left: '20%' },
                      { top: '45%', left: '30%' },
                      { top: '65%', left: '18%' },
                      { top: '68%', left: '72%' },
                      { top: '28%', left: '68%' },
                    ];
                    const pos = positions[i] || { top: '50%', left: '50%' };
                    const cfg = statusConfig[a.status];
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelected(selected === a.id ? null : a.id)}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                          selected === a.id ? 'scale-125 z-10' : 'hover:scale-110'
                        }`}
                        style={{ top: pos.top, left: pos.left }}
                      >
                        <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm ${cfg.dot} ${selected === a.id ? 'ring-2 ring-white ring-offset-1' : ''}`}>
                          🐾
                        </div>
                        {selected === a.id && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg p-2 w-36 text-left z-20">
                            <div className="text-xs font-bold text-gray-900">{a.animalId}</div>
                            <div className="text-xs text-gray-500">{a.species}</div>
                            <div className="text-xs text-gray-400 mt-1">🔋 {a.battery}%</div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-white/80 rounded-lg px-3 py-1 text-xs text-gray-500">
                📍 Cayenne, Guyane française
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-3">
            {selectedAnimal ? (
              <div className="bg-white rounded-xl border border-forest-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{selectedAnimal.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{selectedAnimal.species}</p>
                <div className="space-y-3">
                  {[
                    { label: 'Statut', value: statusConfig[selectedAnimal.status].label, color: statusConfig[selectedAnimal.status].color },
                    { label: 'Enclos', value: selectedAnimal.enclosure, color: 'text-gray-700' },
                    { label: 'Batterie', value: `${selectedAnimal.battery}%`, color: selectedAnimal.battery < 30 ? 'text-red-600' : 'text-green-600' },
                    { label: 'Dernière MAJ', value: timeAgo(selectedAnimal.lastSeen), color: 'text-gray-600' },
                    { label: 'Altitude', value: `${selectedAnimal.altitude} m`, color: 'text-gray-700' },
                    { label: 'Vitesse', value: `${selectedAnimal.speed} m/s`, color: 'text-gray-700' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{item.label}</span>
                      <span className={`font-medium ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Batterie</div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${selectedAnimal.battery < 30 ? 'bg-red-500' : selectedAnimal.battery < 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${selectedAnimal.battery}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-5 text-center text-gray-400 text-sm">
                Cliquez sur un marqueur pour voir les détails
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Balises actives</h4>
              <div className="space-y-2">
                {trackedAnimals.map(a => {
                  const cfg = statusConfig[a.status];
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelected(selected === a.id ? null : a.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        selected === a.id ? 'bg-forest-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">{a.animalId}</div>
                        <div className="text-xs text-gray-400 truncate">{a.enclosure}</div>
                      </div>
                      <div className="text-xs text-gray-500">🔋{a.battery}%</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'list' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Animal</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Espèce</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Enclos</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Batterie</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Dernière MAJ</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Coordonnées</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {trackedAnimals.map(a => {
                const cfg = statusConfig[a.status];
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.animalId}</td>
                    <td className="px-4 py-3 text-gray-500 italic">{a.species}</td>
                    <td className="px-4 py-3 text-gray-600">{a.enclosure}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${a.battery < 30 ? 'bg-red-500' : a.battery < 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${a.battery}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{a.battery}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{timeAgo(a.lastSeen)}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">{a.lat.toFixed(4)}, {a.lng.toFixed(4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'enclosures' && (
        <div className="grid md:grid-cols-2 gap-4">
          {enclosureBoundaries.map((enc, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{enc.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Surface : {enc.area}</p>
                </div>
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: enc.color }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">{enc.animals}</div>
                  <div className="text-xs text-gray-500">animaux</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {trackedAnimals.filter(a => a.enclosure === enc.name).length}
                  </div>
                  <div className="text-xs text-gray-500">balises GPS</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Alertes hors-zone : <span className="font-medium text-green-600">0 ce mois</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
