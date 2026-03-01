'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Bird, Edit2, Trash2 } from 'lucide-react';
import { animauxApi, exportApi } from '@/lib/api';
import { AnimalModal } from '@/components/modals/AnimalModal';

const SEX_LABELS: Record<string, string> = { male: 'Mâle', female: 'Femelle', '': 'Inconnu' };
const STATUS_CLASSES: Record<string, string> = {
  alive: 'bg-forest-100 text-forest-700',
  deceased: 'bg-gray-100 text-gray-600',
  transferred: 'bg-maroni-100 text-maroni-700',
  released: 'bg-gold-100 text-gold-700',
};
const STATUS_LABELS: Record<string, string> = {
  alive: 'Vivant', deceased: 'Décédé', transferred: 'Transféré', released: 'Relâché',
};

export default function AnimauxListePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sexFilter, setSexFilter] = useState('all');
  const [modal, setModal] = useState<{ open: boolean; animal?: any }>({ open: false });

  const { data: animals = [], isLoading } = useQuery({
    queryKey: ['animals'],
    queryFn: animauxApi.animals,
  });

  const { data: stats } = useQuery({ queryKey: ['animal-stats'], queryFn: animauxApi.stats });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => animauxApi.deleteAnimal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['animals'] }),
  });

  const filtered = useMemo(() => {
    let list = animals as any[];
    if (search) list = list.filter((a: any) =>
      (a.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.species?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.species?.commonName ?? '').toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') list = list.filter((a: any) => a.status === statusFilter);
    if (sexFilter !== 'all') list = list.filter((a: any) => a.sex === sexFilter);
    return list;
  }, [animals, search, statusFilter, sexFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Registre des animaux</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats?.aliveAnimals ?? (animals as any[]).length} vivant{(animals as any[]).length !== 1 ? 'aux' : ''} · {stats?.speciesCount ?? 0} espèces
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={exportApi.animauxCsv()}
            download
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </a>
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvel animal
          </button>
        </div>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-display font-bold text-foreground">{stats?.totalAnimals ?? (animals as any[]).length}</p>
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

      {/* Filters */}
      <div className="lftg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom ou espèce..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {['all', 'alive', 'deceased', 'transferred', 'released'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  statusFilter === s ? 'bg-forest-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {s === 'all' ? 'Tous' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {['all', 'male', 'female'].map((s) => (
              <button
                key={s}
                onClick={() => setSexFilter(s)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  sexFilter === s ? 'bg-maroni-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {s === 'all' ? 'Tous sexes' : SEX_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <Bird className="w-10 h-10 mx-auto mb-2 opacity-30" />
          Aucun animal trouvé
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((animal: any) => (
            <div key={animal.id} className="lftg-card p-4 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
                  <Bird className="w-5 h-5 text-forest-600" />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CLASSES[animal.status] ?? 'bg-muted text-muted-foreground'}`}>
                  {STATUS_LABELS[animal.status] ?? animal.status}
                </span>
              </div>
              <h3 className="font-semibold text-foreground text-sm">{animal.name ?? animal.identifier}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {animal.species?.commonName ?? animal.species?.name ?? 'Espèce inconnue'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {animal.sex && <span>{SEX_LABELS[animal.sex] ?? animal.sex}</span>}
                {animal.birthDate && <span>{new Date(animal.birthDate).getFullYear()}</span>}
                {animal.enclosure && <span>📍 {animal.enclosure.name}</span>}
              </div>
              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setModal({ open: true, animal })}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Modifier
                </button>
                <button
                  onClick={() => { if (confirm(`Supprimer ${animal.name ?? animal.identifier} ?`)) deleteMutation.mutate(animal.id); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimalModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false })}
        animal={modal.animal}
      />
    </div>
  );
}
