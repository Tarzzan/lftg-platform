'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Enclosure {
  id: string;
  name: string;
  code: string;
  type: string;
  capacity: number;
  currentOccupancy: number;
  area?: number;
  temperature?: { min: number; max: number };
  humidity?: { min: number; max: number };
  latitude?: number;
  longitude?: number;
  description?: string;
  status: string;
  animals?: Animal[];
}

interface Animal {
  id: string;
  name: string;
  identifier: string;
  status: string;
  species?: { commonName: string; scientificName: string };
}

interface HistoryEvent {
  id: string;
  action: string;
  description: string;
  date: string;
  user: string;
}

// Données mockées pour la démo
const MOCK_ENCLOSURE: Enclosure = {
  id: '1',
  name: 'Volière Tropicale A',
  code: 'VTA-01',
  type: 'VOLIERE',
  capacity: 15,
  currentOccupancy: 8,
  area: 45,
  temperature: { min: 24, max: 32 },
  humidity: { min: 70, max: 85 },
  latitude: 4.9224,
  longitude: -52.3135,
  description: 'Grande volière dédiée aux perroquets et oiseaux tropicaux. Végétation dense avec arbres fruitiers natifs de Guyane.',
  status: 'ACTIVE',
  animals: [
    { id: '1', name: 'Amazona', identifier: 'E-01', status: 'ALIVE', species: { commonName: 'Amazone à front bleu', scientificName: 'Amazona amazonica' } },
    { id: '2', name: 'Perroquet Vert', identifier: 'E-02', status: 'ALIVE', species: { commonName: 'Amazone à front bleu', scientificName: 'Amazona amazonica' } },
    { id: '3', name: 'Ara Bleu', identifier: 'E-03', status: 'CARE', species: { commonName: 'Ara ararauna', scientificName: 'Ara ararauna' } },
    { id: '4', name: 'Harpy', identifier: 'E-04', status: 'ALIVE', species: { commonName: 'Harpie féroce', scientificName: 'Harpia harpyja' } },
  ],
};

const MOCK_HISTORY: HistoryEvent[] = [
  { id: '1', action: 'NETTOYAGE', description: 'Nettoyage complet et désinfection', date: '2026-02-28', user: 'Marie Dupont' },
  { id: '2', action: 'AJOUT_ANIMAL', description: 'Amazona (E-01) ajouté à l\'enclos', date: '2026-02-20', user: 'Jean Martin' },
  { id: '3', action: 'MAINTENANCE', description: 'Remplacement des perchoirs en bois', date: '2026-02-15', user: 'Pierre Leblanc' },
  { id: '4', action: 'INSPECTION', description: 'Inspection vétérinaire de routine', date: '2026-02-10', user: 'Dr. Rousseau' },
  { id: '5', action: 'ALIMENTATION', description: 'Distribution de fruits tropicaux', date: '2026-02-08', user: 'Marie Dupont' },
];

const ACTION_COLORS: Record<string, string> = {
  NETTOYAGE: 'bg-blue-100 text-blue-700',
  AJOUT_ANIMAL: 'bg-green-100 text-green-700',
  MAINTENANCE: 'bg-orange-100 text-orange-700',
  INSPECTION: 'bg-purple-100 text-purple-700',
  ALIMENTATION: 'bg-yellow-100 text-yellow-700',
};

export default function EnclosDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [enclosure, setEnclosure] = useState<Enclosure>(MOCK_ENCLOSURE);
  const [activeTab, setActiveTab] = useState<'overview' | 'animals' | 'map' | 'history'>('overview');
  const [loading, setLoading] = useState(false);

  const occupancyRate = Math.round((enclosure.currentOccupancy / enclosure.capacity) * 100);
  const occupancyColor = occupancyRate >= 90 ? 'text-red-600' : occupancyRate >= 70 ? 'text-orange-500' : 'text-forest-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <h1 className="text-2xl font-bold text-gray-900">{enclosure.name}</h1>
              <span className="px-2 py-0.5 bg-forest-100 text-forest-700 text-xs font-mono rounded">{enclosure.code}</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{enclosure.type} · {enclosure.area} m²</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Modifier
          </button>
          <button className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 transition-colors">
            + Ajouter un animal
          </button>
        </div>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className={`text-3xl font-bold ${occupancyColor}`}>{enclosure.currentOccupancy}/{enclosure.capacity}</div>
          <div className="text-xs text-gray-500 mt-1">Occupation ({occupancyRate}%)</div>
          <div className="mt-2 bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${occupancyRate >= 90 ? 'bg-red-500' : occupancyRate >= 70 ? 'bg-orange-500' : 'bg-forest-500'}`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-3xl font-bold text-blue-600">{enclosure.temperature?.min}–{enclosure.temperature?.max}°C</div>
          <div className="text-xs text-gray-500 mt-1">Plage de température</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-3xl font-bold text-teal-600">{enclosure.humidity?.min}–{enclosure.humidity?.max}%</div>
          <div className="text-xs text-gray-500 mt-1">Humidité relative</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className={`text-3xl font-bold ${enclosure.status === 'ACTIVE' ? 'text-forest-600' : 'text-red-600'}`}>
            {enclosure.status === 'ACTIVE' ? '✓ Actif' : '✗ Inactif'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Statut de l'enclos</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['overview', 'animals', 'map', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-forest-600 text-forest-600 bg-forest-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'overview' ? '📋 Vue générale' :
               tab === 'animals' ? `🦜 Animaux (${enclosure.animals?.length || 0})` :
               tab === 'map' ? '🗺️ Carte' : '📜 Historique'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Vue générale */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Informations</h3>
                <dl className="space-y-2">
                  {[
                    ['Nom', enclosure.name],
                    ['Code', enclosure.code],
                    ['Type', enclosure.type],
                    ['Surface', `${enclosure.area} m²`],
                    ['Capacité maximale', `${enclosure.capacity} animaux`],
                    ['Occupation actuelle', `${enclosure.currentOccupancy} animaux (${occupancyRate}%)`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-1.5 border-b border-gray-100">
                      <dt className="text-sm text-gray-500">{label}</dt>
                      <dd className="text-sm font-medium text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Conditions environnementales</h3>
                <dl className="space-y-2">
                  {[
                    ['Température min.', `${enclosure.temperature?.min}°C`],
                    ['Température max.', `${enclosure.temperature?.max}°C`],
                    ['Humidité min.', `${enclosure.humidity?.min}%`],
                    ['Humidité max.', `${enclosure.humidity?.max}%`],
                    ['Latitude', enclosure.latitude?.toFixed(4) || 'N/A'],
                    ['Longitude', enclosure.longitude?.toFixed(4) || 'N/A'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-1.5 border-b border-gray-100">
                      <dt className="text-sm text-gray-500">{label}</dt>
                      <dd className="text-sm font-medium text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
                {enclosure.description && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{enclosure.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Animaux résidents */}
          {activeTab === 'animals' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">{enclosure.animals?.length} animaux résidents</h3>
                <button className="text-sm text-forest-600 hover:text-forest-700 font-medium">
                  Voir tous les animaux →
                </button>
              </div>
              <div className="space-y-3">
                {enclosure.animals?.map(animal => (
                  <Link
                    key={animal.id}
                    href={`/admin/animaux/${animal.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-forest-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center text-xl">🦜</div>
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-forest-700">{animal.name}</div>
                        <div className="text-xs text-gray-500">{animal.species?.commonName} · <em>{animal.species?.scientificName}</em></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-500">{animal.identifier}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        animal.status === 'ALIVE' ? 'bg-green-100 text-green-700' :
                        animal.status === 'CARE' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {animal.status === 'ALIVE' ? 'Vivant' : animal.status === 'CARE' ? 'Soins' : animal.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Carte Leaflet */}
          {activeTab === 'map' && (
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                <span>📍</span>
                <span>Coordonnées GPS : {enclosure.latitude?.toFixed(6)}, {enclosure.longitude?.toFixed(6)}</span>
              </div>
              {/* Carte SVG stylisée représentant le plan de la ferme */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border-2 border-forest-200 p-6 relative overflow-hidden" style={{ height: '400px' }}>
                {/* Fond forêt */}
                <div className="absolute inset-0 opacity-10">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="absolute text-4xl" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, opacity: 0.3 }}>🌿</div>
                  ))}
                </div>

                {/* Plan de la ferme */}
                <svg width="100%" height="100%" viewBox="0 0 800 350" className="relative z-10">
                  {/* Allées */}
                  <rect x="0" y="150" width="800" height="50" fill="#d4c5a0" opacity="0.5" rx="2" />
                  <rect x="350" y="0" width="50" height="350" fill="#d4c5a0" opacity="0.5" rx="2" />

                  {/* Enclos VTA-01 (sélectionné) */}
                  <rect x="50" y="30" width="250" height="100" fill="#1a5c38" opacity="0.8" rx="8" />
                  <text x="175" y="75" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">VTA-01</text>
                  <text x="175" y="95" textAnchor="middle" fill="white" fontSize="11" opacity="0.9">Volière Tropicale A</text>
                  <text x="175" y="112" textAnchor="middle" fill="white" fontSize="11" opacity="0.8">8/15 animaux</text>

                  {/* Enclos VTB-02 */}
                  <rect x="420" y="30" width="180" height="100" fill="#2d7a4f" opacity="0.6" rx="8" />
                  <text x="510" y="75" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">VTB-02</text>
                  <text x="510" y="95" textAnchor="middle" fill="white" fontSize="11" opacity="0.9">Volière B</text>

                  {/* Enclos REP-01 */}
                  <rect x="620" y="30" width="150" height="100" fill="#c4661a" opacity="0.6" rx="8" />
                  <text x="695" y="75" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">REP-01</text>
                  <text x="695" y="95" textAnchor="middle" fill="white" fontSize="11" opacity="0.9">Reptilarium</text>

                  {/* Enclos AMP-01 */}
                  <rect x="50" y="220" width="150" height="100" fill="#0891b2" opacity="0.6" rx="8" />
                  <text x="125" y="265" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">AMP-01</text>
                  <text x="125" y="285" textAnchor="middle" fill="white" fontSize="11" opacity="0.9">Amphibiarium</text>

                  {/* Bâtiment principal */}
                  <rect x="420" y="220" width="350" height="100" fill="#6b7280" opacity="0.5" rx="8" />
                  <text x="595" y="265" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">🏢 Bâtiment principal</text>
                  <text x="595" y="285" textAnchor="middle" fill="white" fontSize="11" opacity="0.9">Quarantaine · Soins · Bureaux</text>

                  {/* Marqueur de sélection */}
                  <circle cx="175" cy="80" r="8" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.9" />
                  <circle cx="175" cy="80" r="4" fill="#fbbf24" />
                </svg>

                <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg p-3 text-xs space-y-1.5 shadow-sm">
                  <div className="font-semibold text-gray-700 mb-1">Légende</div>
                  {[
                    { color: '#1a5c38', label: 'Enclos sélectionné' },
                    { color: '#2d7a4f', label: 'Volières' },
                    { color: '#c4661a', label: 'Reptilarium' },
                    { color: '#0891b2', label: 'Amphibiarium' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                      <span className="text-gray-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Historique */}
          {activeTab === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Historique des événements</h3>
                <button className="text-sm text-forest-600 hover:text-forest-700 font-medium">
                  Exporter →
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-4">
                  {MOCK_HISTORY.map((event, index) => (
                    <div key={event.id} className="relative pl-10">
                      <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-white border-2 border-forest-400 z-10" />
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${ACTION_COLORS[event.action] || 'bg-gray-100 text-gray-700'}`}>
                              {event.action}
                            </span>
                            <p className="text-sm text-gray-700">{event.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Par {event.user}</p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                            {new Date(event.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
