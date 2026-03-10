'use client';
import { useState, useEffect } from 'react';
import { animauxApi } from '@/lib/api';

interface Animal {
  id: string;
  name: string;
  identifier: string;
  status: string;
  sex?: string;
  birthDate?: string;
  species?: { commonName: string; scientificName: string; citesCategory?: string };
  enclosure?: { name: string };
}

const TYPE_COLORS: Record<string, string> = {
  sale: 'bg-green-100 text-green-800',
  exchange: 'bg-blue-100 text-blue-800',
  wanted: 'bg-purple-100 text-purple-800',
};

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'sale', label: 'Vente' },
  { key: 'exchange', label: 'Échange' },
  { key: 'wanted', label: 'Recherche' },
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'messages' | 'my-listings'>('listings');
  const [filterType, setFilterType] = useState('all');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    animauxApi.animals({ status: 'ALIVE' })
      .then(setAnimals)
      .catch((e: any) => setError(e?.response?.data?.message || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const filteredAnimals = animals.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) &&
        !a.species?.commonName?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Éleveurs</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Plateforme d&apos;échange entre éleveurs agréés — Animaux CITES uniquement
          </p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          + Publier une annonce
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Animaux disponibles', value: loading ? '...' : filteredAnimals.length, color: 'text-green-600' },
          { label: 'Espèces représentées', value: loading ? '...' : new Set(animals.map((a) => a.species?.commonName).filter(Boolean)).size, color: 'text-blue-600' },
          { label: 'Annonces actives', value: '0', color: 'text-purple-600' },
          { label: 'Messages non lus', value: '0', color: 'text-orange-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-border shadow-sm">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex border-b border-gray-200 dark:border-border gap-1">
        {[
          { key: 'listings', label: 'Annonces' },
          { key: 'messages', label: 'Messages' },
          { key: 'my-listings', label: 'Mes annonces' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg ${activeTab === key ? 'bg-white dark:bg-card border border-b-white border-gray-200 dark:border-border text-green-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Filtres + recherche */}
          <div className="flex items-center gap-3 flex-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un animal ou une espèce..."
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterType === f.key ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-card rounded-xl border-2 border-gray-200 dark:border-border p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>
          ) : filteredAnimals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium text-gray-600">Aucun animal trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredAnimals.map((animal) => (
                <div key={animal.id} className="bg-white dark:bg-card rounded-xl border-2 border-gray-200 dark:border-border hover:border-green-300 p-4 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🦜</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{animal.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                          {animal.species?.scientificName ?? 'Espèce inconnue'}
                        </p>
                      </div>
                    </div>
                    {animal.species?.citesCategory && (
                      <span className="text-xs bg-gray-100 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                        CITES {animal.species.citesCategory}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>📍 {animal.enclosure?.name ?? 'Enclos non assigné'}</span>
                    <span>{animal.sex === 'M' ? '♂ Mâle' : animal.sex === 'F' ? '♀ Femelle' : '— Sexe inconnu'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">
                      {animal.status}
                    </span>
                    <button className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">
                      Contacter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-8 text-center text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium text-gray-600">Aucun message</p>
          <p className="text-sm mt-1">Vos échanges avec d&apos;autres éleveurs apparaîtront ici</p>
        </div>
      )}

      {/* My Listings Tab */}
      {activeTab === 'my-listings' && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">📌</div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Aucune annonce publiée</h3>
          <p className="text-sm mb-4">Publiez votre première annonce pour vendre ou échanger des animaux</p>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
            + Publier une annonce
          </button>
        </div>
      )}
    </div>
  );
}
