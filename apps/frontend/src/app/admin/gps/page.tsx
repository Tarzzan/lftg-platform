'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const statusConfig: Record<string, { label: string; color: string; dot: string; emoji: string }> = {
  active: { label: 'Actif', color: 'text-green-700', dot: 'bg-green-500', emoji: '🟢' },
  low_battery: { label: 'Batterie faible', color: 'text-amber-700', dot: 'bg-amber-500', emoji: '🟡' },
  inactive: { label: 'Inactif', color: 'text-gray-500', dot: 'bg-gray-400', emoji: '⚫' },
  out_of_bounds: { label: 'Hors zone', color: 'text-red-700', dot: 'bg-red-500', emoji: '🔴' },
};

function timeAgo(dateStr: string) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}j`;
  if (h > 0) return `${h}h${m}min`;
  return `${m}min`;
}

// Composant carte Leaflet (chargé dynamiquement côté client)
function LeafletMap({ trackers, selected, onSelect }: { trackers: any[]; selected: string | null; onSelect: (id: string | null) => void }) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Charger Leaflet dynamiquement
    import('leaflet').then((L) => {
      // Fix icônes Leaflet avec Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Centre sur la Guyane française (LFTG)
      const center: [number, number] = trackers.length > 0
        ? [trackers[0].currentPosition?.lat || 4.9372, trackers[0].currentPosition?.lng || -52.3261]
        : [4.9372, -52.3261];

      const map = L.map(mapRef.current, {
        center,
        zoom: 16,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Ajouter les marqueurs pour chaque tracker
      markersRef.current = trackers.map((tracker) => {
        const pos = tracker.currentPosition;
        if (!pos?.lat || !pos?.lng) return null;

        const cfg = statusConfig[tracker.status] || statusConfig.inactive;
        const isSelected = selected === tracker.id;

        const icon = L.divIcon({
          html: `
            <div style="
              background: ${tracker.status === 'active' ? '#22c55e' : tracker.status === 'low_battery' ? '#f59e0b' : tracker.status === 'out_of_bounds' ? '#ef4444' : '#9ca3af'};
              border: 3px solid white;
              border-radius: 50%;
              width: ${isSelected ? '28px' : '22px'};
              height: ${isSelected ? '28px' : '22px'};
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: ${isSelected ? '14px' : '11px'};
              cursor: pointer;
              transition: all 0.2s;
            ">🐾</div>
          `,
          className: '',
          iconSize: [isSelected ? 28 : 22, isSelected ? 28 : 22],
          iconAnchor: [isSelected ? 14 : 11, isSelected ? 14 : 11],
        });

        const marker = L.marker([pos.lat, pos.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 180px;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${tracker.animalName}</div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;"><em>${tracker.species}</em></div>
              <div style="font-size: 12px;">🔋 ${tracker.batteryLevel}% · ${cfg.label}</div>
              ${pos.speed ? `<div style="font-size: 12px;">💨 ${pos.speed.toFixed(1)} km/h</div>` : ''}
              ${pos.altitude ? `<div style="font-size: 12px;">⛰️ ${pos.altitude}m alt.</div>` : ''}
              <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">Zone: ${tracker.zone || '—'}</div>
            </div>
          `);

        marker.on('click', () => onSelect(tracker.id));
        return marker;
      }).filter(Boolean);

      // Adapter la vue à tous les marqueurs
      if (trackers.length > 0) {
        const validPositions = trackers
          .filter(t => t.currentPosition?.lat && t.currentPosition?.lng)
          .map(t => [t.currentPosition.lat, t.currentPosition.lng] as [number, number]);
        if (validPositions.length > 1) {
          map.fitBounds(validPositions, { padding: [40, 40] });
        }
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trackers]);

  return (
    <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '12px' }} />
  );
}

export default function GpsPage() {
  const [tab, setTab] = useState<'map' | 'list' | 'enclosures'>('map');
  const [selected, setSelected] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Charger le CSS Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const { data: trackers = [], isLoading, refetch } = useQuery({
    queryKey: ['gps-trackers'],
    queryFn: () => api.get('/gps/trackers').then(r => r.data),
    refetchInterval: 30000, // Rafraîchissement toutes les 30s
  });

  const { data: geofences = [] } = useQuery({
    queryKey: ['gps-geofences'],
    queryFn: () => api.get('/gps/geofences').then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['gps-stats'],
    queryFn: () => api.get('/gps/stats').then(r => r.data),
  });

  const selectedTracker = trackers.find((t: any) => t.id === selected);

  const activeCount = trackers.filter((t: any) => t.status === 'active').length;
  const lowBatteryCount = trackers.filter((t: any) => t.status === 'low_battery').length;
  const outOfBoundsCount = trackers.filter((t: any) => t.status === 'out_of_bounds').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🗺️ Géolocalisation GPS</h1>
          <p className="text-sm text-gray-500 mt-1">Suivi temps réel des animaux équipés de balises GPS</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Temps réel · Rafraîchissement 30s
          </div>
          <button onClick={() => refetch()} className="px-3 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Balises actives', value: stats?.activeTrackers ?? activeCount, icon: '📡', color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Batterie faible', value: stats?.lowBattery ?? lowBatteryCount, icon: '🔋', color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Hors zone', value: stats?.outOfBounds ?? outOfBoundsCount, icon: '⚠️', color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Total balises', value: stats?.totalTrackers ?? trackers.length, icon: '🐾', color: 'text-blue-700', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
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
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'map' ? '🗺️ Carte interactive' : t === 'list' ? '📋 Liste' : '🏠 Enclos'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600" />
          <span className="ml-3 text-gray-500">Chargement des données GPS...</span>
        </div>
      ) : (
        <>
          {tab === 'map' && (
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Carte Leaflet */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: '500px' }}>
                {isClient && trackers.length > 0 ? (
                  <LeafletMap trackers={trackers} selected={selected} onSelect={setSelected} />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-emerald-100">
                    {trackers.length === 0 ? (
                      <div className="text-center">
                        <p className="text-4xl mb-3">📡</p>
                        <p className="text-gray-500">Aucune balise GPS active</p>
                        <p className="text-sm text-gray-400 mt-1">Associez des balises GPS aux animaux pour les suivre</p>
                      </div>
                    ) : (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600" />
                    )}
                  </div>
                )}
              </div>

              {/* Panneau latéral */}
              <div className="space-y-3">
                {selectedTracker ? (
                  <div className="bg-white rounded-xl border border-forest-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{selectedTracker.animalName}</h3>
                      <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
                    </div>
                    <p className="text-xs text-gray-500 italic mb-3">{selectedTracker.species}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Statut</span>
                        <span className={`font-medium ${statusConfig[selectedTracker.status]?.color}`}>
                          {statusConfig[selectedTracker.status]?.emoji} {statusConfig[selectedTracker.status]?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Batterie</span>
                        <span className={`font-medium ${selectedTracker.batteryLevel < 20 ? 'text-red-600' : selectedTracker.batteryLevel < 40 ? 'text-amber-600' : 'text-green-600'}`}>
                          🔋 {selectedTracker.batteryLevel}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Zone</span>
                        <span className="font-medium text-gray-700">{selectedTracker.zone || '—'}</span>
                      </div>
                      {selectedTracker.currentPosition?.speed !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Vitesse</span>
                          <span className="font-medium">{selectedTracker.currentPosition.speed.toFixed(1)} km/h</span>
                        </div>
                      )}
                      {selectedTracker.currentPosition?.altitude !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Altitude</span>
                          <span className="font-medium">{selectedTracker.currentPosition.altitude}m</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Vu il y a</span>
                        <span className="font-medium">{timeAgo(selectedTracker.lastSeen)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Coordonnées</span>
                        <span className="font-mono text-xs text-gray-600">
                          {selectedTracker.currentPosition?.lat?.toFixed(4)}, {selectedTracker.currentPosition?.lng?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
                    Cliquez sur un marqueur pour voir les détails
                  </div>
                )}

                {/* Liste compacte des trackers */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 text-sm font-medium text-gray-700">
                    Balises actives ({trackers.length})
                  </div>
                  <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                    {trackers.map((tracker: any) => {
                      const cfg = statusConfig[tracker.status] || statusConfig.inactive;
                      return (
                        <button
                          key={tracker.id}
                          onClick={() => setSelected(selected === tracker.id ? null : tracker.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${selected === tracker.id ? 'bg-forest-50' : ''}`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{tracker.animalName}</div>
                            <div className="text-xs text-gray-500 truncate">{tracker.zone || tracker.species}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={`text-xs font-medium ${tracker.batteryLevel < 20 ? 'text-red-600' : 'text-gray-500'}`}>
                              🔋{tracker.batteryLevel}%
                            </div>
                            <div className="text-xs text-gray-400">{timeAgo(tracker.lastSeen)}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'list' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Animal</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Espèce</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Statut</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Batterie</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Zone</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Position</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Dernière vue</th>
                  </tr>
                </thead>
                <tbody>
                  {trackers.map((tracker: any) => {
                    const cfg = statusConfig[tracker.status] || statusConfig.inactive;
                    return (
                      <tr key={tracker.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{tracker.animalName}</td>
                        <td className="py-3 px-4 text-gray-500 italic text-xs">{tracker.species}</td>
                        <td className="py-3 px-4">
                          <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${tracker.batteryLevel < 20 ? 'bg-red-500' : tracker.batteryLevel < 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                                style={{ width: `${tracker.batteryLevel}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{tracker.batteryLevel}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">{tracker.zone || '—'}</td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">
                          {tracker.currentPosition?.lat?.toFixed(4)}, {tracker.currentPosition?.lng?.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{timeAgo(tracker.lastSeen)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'enclosures' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {geofences.length === 0 ? (
                <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <p className="text-4xl mb-3">🏠</p>
                  <p className="text-gray-500">Aucun enclos défini dans le système GPS.</p>
                </div>
              ) : (
                geofences.map((zone: any) => {
                  const zoneTrackers = trackers.filter((t: any) => t.zone === zone.name);
                  return (
                    <div key={zone.id || zone.name} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: zone.color + '20' }}>
                          🏠
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                          <p className="text-xs text-gray-500">{zone.area || '—'} · {zoneTrackers.length} balise(s)</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {zoneTrackers.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">Aucune balise dans cette zone</p>
                        ) : (
                          zoneTrackers.map((t: any) => {
                            const cfg = statusConfig[t.status] || statusConfig.inactive;
                            return (
                              <div key={t.id} className="flex items-center gap-2 text-xs">
                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                <span className="text-gray-700">{t.animalName}</span>
                                <span className="ml-auto text-gray-400">🔋{t.batteryLevel}%</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
