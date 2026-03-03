'use client';

import { useState } from 'react';

const GBIF_SPECIES = [
  { name: 'Ara ararauna', common: 'Ara bleu et jaune', class: 'Aves', family: 'Psittacidae', iucn: 'LC', cites: 'II', occurrences: 48291, lftgCount: 8, emoji: '🦜', color: 'from-blue-500 to-yellow-400' },
  { name: 'Amazona amazonica', common: 'Amazone à front bleu', class: 'Aves', family: 'Psittacidae', iucn: 'LC', cites: 'II', occurrences: 32156, lftgCount: 12, emoji: '🦜', color: 'from-green-500 to-emerald-400' },
  { name: 'Dendrobates azureus', common: 'Dendrobate azuré', class: 'Amphibia', family: 'Dendrobatidae', iucn: 'VU', cites: 'II', occurrences: 1247, lftgCount: 24, emoji: '🐸', color: 'from-blue-600 to-cyan-400' },
  { name: 'Boa constrictor', common: 'Boa constricteur', class: 'Reptilia', family: 'Boidae', iucn: 'LC', cites: 'II', occurrences: 28934, lftgCount: 5, emoji: '🐍', color: 'from-amber-600 to-yellow-500' },
  { name: 'Caiman crocodilus', common: 'Caïman à lunettes', class: 'Reptilia', family: 'Alligatoridae', iucn: 'LC', cites: 'II', occurrences: 15678, lftgCount: 2, emoji: '🐊', color: 'from-green-700 to-lime-500' },
];

const OCCURRENCES_GUYANE = [
  { species: 'Ara ararauna', lat: 4.93, lng: -52.33, locality: 'Cayenne', date: '15 Jan 2026', observer: 'MNHN' },
  { species: 'Ara ararauna', lat: 5.50, lng: -54.03, locality: 'Saint-Laurent-du-Maroni', date: '03 Déc 2025', observer: 'CNRS' },
  { species: 'Dendrobates azureus', lat: 3.88, lng: -53.00, locality: 'Maripasoula', date: '22 Nov 2025', observer: 'WWF' },
  { species: 'Boa constrictor', lat: 5.16, lng: -52.65, locality: 'Kourou', date: '08 Jan 2026', observer: 'PAG' },
  { species: 'Caiman crocodilus', lat: 4.02, lng: -52.68, locality: 'Saül', date: '30 Jan 2026', observer: 'LFTG' },
];

const IUCN_COLORS: Record<string, string> = {
  LC: 'bg-green-100 text-green-700 border-green-200',
  NT: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  VU: 'bg-orange-100 text-orange-700 border-orange-200',
  EN: 'bg-red-100 text-red-700 border-red-200',
  CR: 'bg-red-200 text-red-800 border-red-300',
};

const IUCN_LABELS: Record<string, string> = {
  LC: 'Préoccupation mineure',
  NT: 'Quasi menacée',
  VU: 'Vulnérable',
  EN: 'En danger',
  CR: 'En danger critique',
};

export default function GbifPage() {
  const [selectedSpecies, setSelectedSpecies] = useState<typeof GBIF_SPECIES[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  const filtered = GBIF_SPECIES.filter(sp => {
    const matchSearch = !searchQuery || sp.name.toLowerCase().includes(searchQuery.toLowerCase()) || sp.common.toLowerCase().includes(searchQuery.toLowerCase());
    const matchClass = filterClass === 'all' || sp.class === filterClass;
    return matchSearch && matchClass;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl">🌍</span> GBIF Biodiversité
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Global Biodiversity Information Facility — Données de conservation des espèces LFTG</p>
        </div>
        <a
          href="https://www.gbif.org"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          GBIF.org →
        </a>
      </div>

      {/* Stats biodiversité */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Espèces suivies', value: '5', icon: '🦜', color: 'text-green-600' },
          { label: 'Occurrences GBIF', value: '126 306', icon: '📍', color: 'text-blue-600' },
          { label: 'Espèces CITES', value: '5', icon: '📋', color: 'text-purple-600' },
          { label: 'Espèces vulnérables', value: '1', icon: '⚠️', color: 'text-orange-600' },
          { label: 'Occurrences Guyane', value: '847', icon: '🗺️', color: 'text-teal-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher une espèce..."
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
        />
        <select
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Toutes les classes</option>
          <option value="Aves">Oiseaux (Aves)</option>
          <option value="Reptilia">Reptiles</option>
          <option value="Amphibia">Amphibiens</option>
        </select>
      </div>

      {/* Grille des espèces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(sp => (
          <div
            key={sp.name}
            onClick={() => setSelectedSpecies(selectedSpecies?.name === sp.name ? null : sp)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all"
          >
            <div className={`h-20 bg-gradient-to-br ${sp.color} flex items-center justify-center`}>
              <span className="text-5xl">{sp.emoji}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{sp.common}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm italic">{sp.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-forest-600 dark:text-forest-400">{sp.lftgCount}</div>
                  <div className="text-xs text-gray-400">individus LFTG</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{sp.class}</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{sp.family}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${IUCN_COLORS[sp.iucn]}`}>UICN {sp.iucn}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">CITES II</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {sp.occurrences.toLocaleString('fr-FR')} occurrences mondiales GBIF
              </div>

              {selectedSpecies?.name === sp.name && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut UICN</div>
                    <div className={`text-sm font-semibold ${sp.iucn === 'VU' ? 'text-orange-600' : 'text-green-600'}`}>
                      {sp.iucn} — {IUCN_LABELS[sp.iucn]}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Annexe CITES</div>
                    <div className="text-sm text-gray-900 dark:text-white">Annexe {sp.cites} — Permis d'exportation requis</div>
                  </div>
                  <a
                    href={`https://www.gbif.org/species/search?q=${encodeURIComponent(sp.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-green-600 hover:text-green-800 font-medium"
                    onClick={e => e.stopPropagation()}
                  >
                    Voir sur GBIF.org →
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Occurrences récentes en Guyane */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Occurrences récentes en Guyane française</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Espèce', 'Localité', 'Coordonnées', 'Date', 'Observateur'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {OCCURRENCES_GUYANE.map((occ, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-sm italic text-gray-900 dark:text-white">{occ.species}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">📍 {occ.locality}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">{occ.lat.toFixed(2)}°N, {occ.lng.toFixed(2)}°W</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{occ.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{occ.observer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
