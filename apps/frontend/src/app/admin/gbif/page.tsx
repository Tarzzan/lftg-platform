'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface GBIFSpecies {
  key?: number;
  scientificName: string;
  canonicalName?: string;
  vernacularName?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  status?: string;
  rank?: string;
  threatStatus?: string;
  habitat?: string;
}

interface GBIFSearchResult {
  results?: GBIFSpecies[];
  count?: number;
  endOfRecords?: boolean;
}

const threatColors: Record<string, { label: string; color: string; bg: string }> = {
  EXTINCT: { label: 'Éteint', color: 'text-black', bg: 'bg-black' },
  EXTINCT_IN_THE_WILD: { label: 'Éteint à l\'état sauvage', color: 'text-gray-400', bg: 'bg-gray-800' },
  CRITICALLY_ENDANGERED: { label: 'En danger critique', color: 'text-red-400', bg: 'bg-red-900/30' },
  ENDANGERED: { label: 'En danger', color: 'text-orange-400', bg: 'bg-orange-900/30' },
  VULNERABLE: { label: 'Vulnérable', color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  NEAR_THREATENED: { label: 'Quasi menacé', color: 'text-lime-400', bg: 'bg-lime-900/30' },
  LEAST_CONCERN: { label: 'Préoccupation mineure', color: 'text-green-400', bg: 'bg-green-900/30' },
};

export default function GBIFPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const { data: species, isLoading, isError, error } = useQuery<GBIFSearchResult>({
    queryKey: ['gbif-species', activeSearch],
    queryFn: async () => {
      const res = await api.get(`/gbif/species${activeSearch ? `?q=${encodeURIComponent(activeSearch)}` : ''}`);
      return res.data;
    },
    enabled: true,
  });

  const handleSearch = () => {
    setActiveSearch(searchQuery);
  };

  const results = species?.results || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Base de données GBIF</h1>
        <p className="text-slate-400 mt-1">Référentiel taxonomique mondial des espèces</p>
      </div>

      {/* Barre de recherche */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher une espèce (ex: Ara ararauna, Python reticulatus...)"
            className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {isLoading ? '...' : '🔍 Rechercher'}
          </button>
        </div>
      </div>

      {/* Résultats */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : results.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <p className="text-4xl mb-3">🔬</p>
          <p className="text-slate-300 font-semibold">
            {activeSearch ? 'Aucune espèce trouvée' : 'Lancez une recherche pour explorer la base GBIF'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">{species?.count?.toLocaleString('fr-FR') || results.length} résultat(s)</p>
          {results.map((sp, i) => {
            const threat = sp.threatStatus ? threatColors[sp.threatStatus] : null;
            return (
              <div key={sp.key || i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold italic">{sp.scientificName}</h3>
                      {sp.rank && (
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{sp.rank}</span>
                      )}
                      {threat && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${threat.bg} ${threat.color}`}>
                          {threat.label}
                        </span>
                      )}
                    </div>
                    {sp.vernacularName && (
                      <p className="text-slate-300 mt-1">{sp.vernacularName}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-slate-400 text-xs flex-wrap">
                      {sp.kingdom && <span>Règne : {sp.kingdom}</span>}
                      {sp.family && <span>Famille : {sp.family}</span>}
                      {sp.genus && <span>Genre : {sp.genus}</span>}
                      {sp.habitat && <span>Habitat : {sp.habitat}</span>}
                    </div>
                  </div>
                  {sp.status && (
                    <span className={`text-xs px-2 py-1 rounded ${sp.status === 'ACCEPTED' ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                      {sp.status === 'ACCEPTED' ? 'Accepté' : sp.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
