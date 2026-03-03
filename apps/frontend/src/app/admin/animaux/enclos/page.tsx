// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  MAINTENANCE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const TYPE_ICONS: Record<string, string> = {
  terrarium: '🦎',
  volière: '🦜',
  bassin: '🐠',
  paddock: '🦌',
  cage: '🐦',
  autre: '🏠',
};

interface EnclosFormData {
  name: string;
  type: string;
  capacity: string;
  surface: string;
  location: string;
  description: string;
  latitude: string;
  longitude: string;
  features: string;
}

// Composant carte Leaflet (lazy-loaded pour éviter le SSR)
function EnclosMap({ enclos, onSelect }: { enclos: any[]; onSelect: (id: string) => void }) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Charger Leaflet dynamiquement
    const loadLeaflet = async () => {
      if (mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Fix icônes Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Initialiser la carte centrée sur la Guyane
      const map = L.map(mapRef.current, {
        center: [4.0, -53.0],
        zoom: 8,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Ajouter les marqueurs
      const enclosWithCoords = enclos.filter(e => e.latitude && e.longitude);
      enclosWithCoords.forEach(enclos => {
        const occupancyColor = enclos.occupancyRate >= 90 ? '#ef4444' : enclos.occupancyRate >= 70 ? '#f59e0b' : '#22c55e';

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background: white;
            border: 3px solid ${occupancyColor};
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          ">${TYPE_ICONS[enclos.type] || '🏠'}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([enclos.latitude, enclos.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 180px; font-family: system-ui;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px;">${TYPE_ICONS[enclos.type] || '🏠'} ${enclos.name}</div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Type : ${enclos.type}</div>
              <div style="font-size: 12px; margin-bottom: 4px;">
                <span style="color: ${occupancyColor}; font-weight: 600;">${enclos.animalCount} / ${enclos.capacity}</span> animaux
              </div>
              <div style="background: #f3f4f6; border-radius: 4px; height: 6px; margin-bottom: 8px;">
                <div style="background: ${occupancyColor}; width: ${enclos.occupancyRate}%; height: 100%; border-radius: 4px;"></div>
              </div>
              <div style="font-size: 11px; color: #9ca3af;">${enclos.location || 'Localisation non définie'}</div>
            </div>
          `)
          .on('click', () => onSelect(enclos.id));

        markersRef.current.push(marker);
      });

      // Si des enclos ont des coordonnées, ajuster la vue
      if (enclosWithCoords.length > 0) {
        const bounds = L.latLngBounds(enclosWithCoords.map((e: any) => [e.latitude, e.longitude]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [enclos]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl"
      style={{ minHeight: '400px' }}
    />
  );
}

export default function EnclosPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<EnclosFormData>({
    name: '', type: 'terrarium', capacity: '1', surface: '', location: '',
    description: '', latitude: '', longitude: '', features: '',
  });

  const { data: enclosData, isLoading } = useQuery({
    queryKey: ['enclos', filterStatus, filterType, search],
    queryFn: () => api.get('/plugins/animaux/enclosures', {
      params: { status: filterStatus || undefined, type: filterType || undefined, search: search || undefined },
    }).then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['enclos-stats'],
    queryFn: () => api.get('/plugins/animaux/enclosures').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/plugins/animaux/enclosures', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enclos'] });
      queryClient.invalidateQueries({ queryKey: ['enclos-stats'] });
      setShowModal(false);
      setForm({ name: '', type: 'terrarium', capacity: '1', surface: '', location: '', description: '', latitude: '', longitude: '', features: '' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/plugins/animaux/enclosures/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enclos'] });
      queryClient.invalidateQueries({ queryKey: ['enclos-stats'] });
    },
  });

  const enclos = enclosData || [];
  const selected = enclos.find((e: any) => e.id === selectedId);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enclos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats?.active || 0} actif(s) · {stats?.maintenance || 0} en maintenance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'grid' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}
            >
              ⊞ Grille
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'map' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}
            >
              🗺️ Carte
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 transition-colors"
          >
            + Nouvel enclos
          </button>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total enclos', value: stats.total, icon: '🏠' },
            { label: 'Animaux hébergés', value: stats.totalAnimals, icon: '🦜' },
            { label: 'Capacité totale', value: stats.totalCapacity, icon: '📊' },
            { label: 'Taux d\'occupation', value: `${stats.globalOccupancy}%`, icon: '📈' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="text-2xl mb-1">{kpi.icon}</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
              <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Rechercher un enclos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="INACTIVE">Inactif</option>
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Tous les types</option>
          {Object.entries(TYPE_ICONS).map(([type, icon]) => (
            <option key={type} value={type}>{icon} {type}</option>
          ))}
        </select>
      </div>

      {/* Vue carte */}
      {view === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ height: '500px' }}>
            <EnclosMap enclos={enclos} onSelect={setSelectedId} />
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {selectedId ? 'Enclos sélectionné' : 'Cliquez sur un marqueur'}
            </h3>
            {selected ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{TYPE_ICONS[selected.type] || '🏠'}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selected.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[selected.status]}`}>
                      {selected.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selected.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Animaux</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selected.animalCount} / {selected.capacity}</span>
                  </div>
                  {selected.surface && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Surface</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selected.surface} m²</span>
                    </div>
                  )}
                  {selected.location && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Localisation</span>
                      <span className="font-medium text-gray-900 dark:text-white text-right max-w-32 truncate">{selected.location}</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Occupation</span>
                    <span>{selected.occupancyRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full transition-all ${selected.occupancyRate >= 90 ? 'bg-red-500' : selected.occupancyRate >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${selected.occupancyRate}%` }}
                    />
                  </div>
                </div>
                {selected.animals?.slice(0, 5).map((animal: any) => (
                  <div key={animal.id} className="flex items-center gap-2 text-sm">
                    <span>🦜</span>
                    <span className="text-gray-700 dark:text-gray-300">{animal.name || animal.identifier}</span>
                    <span className="text-gray-400 text-xs">{animal.species?.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center text-gray-400">
                <p className="text-3xl mb-2">🗺️</p>
                <p className="text-sm">Sélectionnez un enclos sur la carte</p>
              </div>
            )}

            {/* Liste compacte */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {enclos.map((e: any) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedId === e.id
                      ? 'bg-forest-50 dark:bg-forest-900/20 border border-forest-200 dark:border-forest-700'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{TYPE_ICONS[e.type] || '🏠'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.name}</p>
                    <p className="text-xs text-gray-400">{e.animalCount}/{e.capacity} animaux</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_COLORS[e.status]}`}>
                    {e.status === 'ACTIVE' ? '✓' : e.status === 'MAINTENANCE' ? '⚙' : '✗'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vue grille */}
      {view === 'grid' && (
        isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600" />
          </div>
        ) : enclos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏠</p>
            <p>Aucun enclos trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {enclos.map((enclos: any) => (
              <div
                key={enclos.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center text-xl">
                      {TYPE_ICONS[enclos.type] || '🏠'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{enclos.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{enclos.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[enclos.status]}`}>
                    {enclos.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-500 mb-3">
                  {enclos.location && (
                    <div className="flex justify-between">
                      <span>Localisation</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-32">{enclos.location}</span>
                    </div>
                  )}
                  {enclos.surface && (
                    <div className="flex justify-between">
                      <span>Surface</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{enclos.surface} m²</span>
                    </div>
                  )}
                  {enclos.latitude && (
                    <div className="flex justify-between">
                      <span>Coordonnées GPS</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{enclos.latitude.toFixed(4)}, {enclos.longitude.toFixed(4)}</span>
                    </div>
                  )}
                </div>

                {/* Barre d'occupation */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{enclos.animalCount} animaux</span>
                    <span>Capacité : {enclos.capacity}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        enclos.occupancyRate >= 90 ? 'bg-red-500' :
                        enclos.occupancyRate >= 70 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${enclos.occupancyRate}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-400 mt-0.5">{enclos.occupancyRate}%</div>
                </div>

                {/* Features */}
                {enclos.features?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {enclos.features.slice(0, 3).map((f: string) => (
                      <span key={f} className="px-2 py-0.5 bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400 text-xs rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {enclos.status === 'ACTIVE' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: enclos.id, status: 'MAINTENANCE' })}
                      className="flex-1 py-1.5 text-xs border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                    >
                      ⚙️ Maintenance
                    </button>
                  )}
                  {enclos.status === 'MAINTENANCE' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: enclos.id, status: 'ACTIVE' })}
                      className="flex-1 py-1.5 text-xs border border-green-300 text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    >
                      ✓ Réactiver
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedId(enclos.id); setView('map'); }}
                    className="flex-1 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    🗺️ Voir sur carte
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">🏠 Nouvel enclos</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Terrarium A1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {Object.entries(TYPE_ICONS).map(([type, icon]) => (
                      <option key={type} value={type}>{icon} {type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacité *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Surface (m²)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.surface}
                    onChange={e => setForm(p => ({ ...p, surface: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="12.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Bâtiment B, Salle 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude GPS</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.latitude}
                    onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="4.0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude GPS</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.longitude}
                    onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="-53.0000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Équipements (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={form.features}
                    onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Chauffage, UV, Brumisation"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Description de l'enclos..."
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => createMutation.mutate({
                  name: form.name,
                  type: form.type,
                  capacity: parseInt(form.capacity),
                  surface: form.surface ? parseFloat(form.surface) : undefined,
                  location: form.location || undefined,
                  description: form.description || undefined,
                  latitude: form.latitude ? parseFloat(form.latitude) : undefined,
                  longitude: form.longitude ? parseFloat(form.longitude) : undefined,
                  features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
                })}
                disabled={!form.name || createMutation.isPending}
                className="flex-1 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? 'Création...' : 'Créer l\'enclos'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
