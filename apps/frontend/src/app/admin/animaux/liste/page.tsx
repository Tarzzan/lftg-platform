'use client';

import { useQuery } from '@tanstack/react-query';
import { Bird, Plus, Search, Filter } from 'lucide-react';
import { animauxApi } from '@/lib/api';
import { useState } from 'react';

export default function AnimauxListePage() {
  const [search, setSearch] = useState('');
  const [showDeceased, setShowDeceased] = useState(false);

  const { data: animals, isLoading } = useQuery({
    queryKey: ['animals', showDeceased],
    queryFn: () => animauxApi.animals({ isAlive: showDeceased ? undefined : true }),
  });

  const { data: stats } = useQuery({ queryKey: ['animal-stats'], queryFn: animauxApi.stats });

  const filtered = (animals || []).filter((a: any) =>
    a.identifier.toLowerCase().includes(search.toLowerCase()) ||
    a.species?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Animaux</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats?.aliveAnimals ?? 0} vivants · {stats?.speciesCount ?? 0} espèces · {stats?.activeBroods ?? 0} couvées actives
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Enregistrer un animal
        </button>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Total animaux</p>
          <p className="text-2xl font-display font-bold text-foreground">{stats?.totalAnimals ?? '—'}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Vivants</p>
          <p className="text-2xl font-display font-bold text-forest-700">{stats?.aliveAnimals ?? '—'}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Espèces</p>
          <p className="text-2xl font-display font-bold text-maroni-700">{stats?.speciesCount ?? '—'}</p>
        </div>
      </div>

      <div className="lftg-card p-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par identifiant ou espèce..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showDeceased}
              onChange={(e) => setShowDeceased(e.target.checked)}
              className="rounded border-border"
            />
            Inclure décédés
          </label>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((animal: any) => (
              <div key={animal.id} className="border border-border rounded-xl p-4 hover:border-forest-300 hover:shadow-lftg transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
                    <Bird className="w-5 h-5 text-forest-700" />
                  </div>
                  <span className={`lftg-badge ${animal.isAlive ? 'badge-approved' : 'badge-rejected'}`}>
                    {animal.isAlive ? 'Vivant' : 'Décédé'}
                  </span>
                </div>
                <p className="font-semibold text-foreground font-mono text-sm">{animal.identifier}</p>
                <p className="text-sm text-muted-foreground">{animal.species?.name}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  {animal.sex && <span>Sexe: {animal.sex}</span>}
                  {animal.enclosure && <span>Enclos: {animal.enclosure.name}</span>}
                </div>
                {animal.birthDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Né le: {new Date(animal.birthDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-center py-12 text-muted-foreground text-sm">Aucun animal trouvé</p>
        )}
      </div>
    </div>
  );
}
