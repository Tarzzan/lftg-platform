'use client';
import { toast } from 'sonner';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, Filter, Download, Bird, Edit2, Trash2,
  MapPin, Calendar, ShieldCheck, AlertTriangle, Eye,
  TrendingUp, Heart, Leaf, Zap
} from 'lucide-react';
import Link from 'next/link';
import { animauxApi, exportApi } from '@/lib/api';
import { AnimalModal } from '@/components/modals/AnimalModal';

const SEX_LABELS: Record<string, string> = { male: '♂ Mâle', female: '♀ Femelle', '': 'Inconnu' };
const SEX_COLORS: Record<string, string> = { male: 'text-blue-600', female: 'text-pink-600', '': 'text-gray-400' };

const STATUS_CONFIG: Record<string, { label: string; bg: string; dot: string }> = {
  alive:       { label: 'Vivant',    bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  ACTIF:       { label: 'Vivant',    bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  deceased:    { label: 'Décédé',    bg: 'bg-gray-100 text-gray-500',       dot: 'bg-gray-400' },
  transferred: { label: 'Transféré', bg: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500' },
  released:    { label: 'Relâché',   bg: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500' },
};

const CITES_CONFIG: Record<string, { label: string; color: string }> = {
  'I':         { label: 'CITES I',  color: 'bg-red-100 text-red-700 border border-red-200' },
  'II':        { label: 'CITES II', color: 'bg-orange-100 text-orange-700 border border-orange-200' },
  'Non listé': { label: 'Non CITES', color: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

// Emoji par groupe taxonomique
function getAnimalEmoji(species?: any): string {
  const name = (species?.name ?? species?.commonName ?? '').toLowerCase();
  if (name.includes('ara') || name.includes('perroquet') || name.includes('toucan')) return '🦜';
  if (name.includes('caïman') || name.includes('crocodil')) return '🐊';
  if (name.includes('tortue')) return '🐢';
  if (name.includes('anaconda') || name.includes('serpent') || name.includes('boa')) return '🐍';
  if (name.includes('agouti') || name.includes('rongeur')) return '🐀';
  if (name.includes('pécari') || name.includes('suidé')) return '🐗';
  if (name.includes('singe') || name.includes('primate')) return '🐒';
  if (name.includes('jaguar') || name.includes('félin')) return '🐆';
  return '🦎';
}

// Couleur de fond par groupe
function getCardGradient(species?: any): string {
  const name = (species?.name ?? '').toLowerCase();
  if (name.includes('ara') || name.includes('toucan')) return 'from-emerald-50 to-teal-50 border-emerald-200';
  if (name.includes('caïman')) return 'from-slate-50 to-gray-50 border-slate-200';
  if (name.includes('tortue')) return 'from-amber-50 to-yellow-50 border-amber-200';
  if (name.includes('anaconda') || name.includes('boa')) return 'from-purple-50 to-violet-50 border-purple-200';
  if (name.includes('agouti')) return 'from-orange-50 to-amber-50 border-orange-200';
  if (name.includes('pécari')) return 'from-rose-50 to-pink-50 border-rose-200';
  return 'from-forest-50 to-emerald-50 border-forest-200';
}

export default function AnimauxListePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sexFilter, setSexFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modal, setModal] = useState<{ open: boolean; animal?: any }>({ open: false });

  const { data: animals = [], isLoading, isError, error } = useQuery({
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
      (a.identifier ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.species?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.species?.commonName ?? '').toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') list = list.filter((a: any) => a.status === statusFilter || (statusFilter === 'alive' && a.status === 'ACTIF'));
    if (sexFilter !== 'all') list = list.filter((a: any) => a.sex === sexFilter);
    return list;
  }, [animals, search, statusFilter, sexFilter]);

  const aliveCount = (animals as any[]).filter((a: any) => a.status === 'alive' || a.status === 'ACTIF').length;
  const citesCount = (animals as any[]).filter((a: any) => a.species?.citesStatus && a.species.citesStatus !== 'Non listé').length;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-700 via-forest-600 to-emerald-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-8 text-8xl">🦜</div>
          <div className="absolute bottom-2 right-32 text-6xl">🐊</div>
          <div className="absolute top-4 right-48 text-5xl">🐢</div>
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Registre des Animaux</h1>
            <p className="text-forest-100 text-sm mt-1">La Ferme Tropicale de Guyane — PK20.5 Kourou</p>
            <div className="flex items-center gap-6 mt-4">
              <div>
                <p className="text-3xl font-display font-bold">{stats?.totalAnimals ?? (animals as any[]).length}</p>
                <p className="text-xs text-forest-200">Animaux enregistrés</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-3xl font-display font-bold text-emerald-300">{aliveCount}</p>
                <p className="text-xs text-forest-200">Vivants</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-3xl font-display font-bold text-amber-300">{stats?.speciesCount ?? 0}</p>
                <p className="text-xs text-forest-200">Espèces</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-3xl font-display font-bold text-red-300">{citesCount}</p>
                <p className="text-xs text-forest-200">Sous CITES</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={exportApi.animauxCsv()}
              download
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </a>
            <button
              onClick={() => setModal({ open: true })}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-forest-700 rounded-lg hover:bg-forest-50 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nouvel animal
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="lftg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom, identifiant ou espèce..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          {/* Statut */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'alive', label: '● Vivants' },
              { key: 'deceased', label: 'Décédés' },
              { key: 'transferred', label: 'Transférés' },
              { key: 'released', label: 'Relâchés' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  statusFilter === key
                    ? 'bg-forest-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sexe */}
          <div className="flex items-center gap-1.5">
            {[
              { key: 'all', label: 'Tous sexes' },
              { key: 'male', label: '♂ Mâles' },
              { key: 'female', label: '♀ Femelles' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSexFilter(key)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  sexFilter === key
                    ? 'bg-maroni-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Vue */}
          <div className="ml-auto flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1 text-xs rounded transition-colors ${viewMode === 'grid' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
            >
              ⊞ Grille
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 text-xs rounded transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
            >
              ≡ Liste
            </button>
          </div>
        </div>

        {/* Résultats */}
        <p className="text-xs text-muted-foreground mt-3">
          {filtered.length} animal{filtered.length !== 1 ? 'aux' : ''} affiché{filtered.length !== 1 ? 's' : ''}
          {search && ` pour "${search}"`}
        </p>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="lftg-card p-4 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-muted mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground font-medium">Aucun animal trouvé</p>
          <p className="text-sm text-muted-foreground mt-1">Essayez de modifier vos filtres</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((animal: any) => {
            const statusCfg = STATUS_CONFIG[animal.status] ?? STATUS_CONFIG.alive;
            const citesCfg = CITES_CONFIG[animal.species?.citesStatus ?? 'Non listé'];
            const emoji = getAnimalEmoji(animal.species);
            const gradient = getCardGradient(animal.species);
            const age = animal.birthDate
              ? Math.floor((Date.now() - new Date(animal.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
              : null;

            return (
              <div
                key={animal.id}
                className={`group relative rounded-xl border bg-gradient-to-br ${gradient} p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
              >
                {/* Badge statut */}
                <div className="absolute top-3 right-3">
                  <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                  </span>
                </div>

                {/* Emoji espèce */}
                <div className="text-4xl mb-3 select-none">{emoji}</div>

                {/* Nom et espèce */}
                <h3 className="font-bold text-foreground text-base leading-tight">
                  {animal.name ?? animal.identifier}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 italic">
                  {animal.species?.scientificName ?? animal.species?.name ?? 'Espèce inconnue'}
                </p>
                <p className="text-xs font-medium text-foreground/70 mt-0.5">
                  {animal.species?.commonName}
                </p>

                {/* Métadonnées */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {animal.sex && (
                    <span className={`text-xs font-medium ${SEX_COLORS[animal.sex] ?? 'text-gray-500'}`}>
                      {SEX_LABELS[animal.sex]}
                    </span>
                  )}
                  {age !== null && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {age} an{age !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Enclos */}
                {animal.enclosure && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{animal.enclosure.name}</span>
                  </div>
                )}

                {/* Badge CITES */}
                {animal.species?.citesStatus && animal.species.citesStatus !== 'Non listé' && (
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${citesCfg?.color}`}>
                      {citesCfg?.label}
                    </span>
                  </div>
                )}

                {/* Identifiant */}
                <p className="text-xs text-muted-foreground/60 mt-2 font-mono">{animal.identifier}</p>

                {/* Actions au survol */}
                <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/admin/animaux/${animal.id}`}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-white/80 hover:bg-white rounded-lg transition-colors shadow-sm"
                  >
                    <Eye className="w-3 h-3" /> Fiche
                  </Link>
                  <button
                    onClick={() => setModal({ open: true, animal })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/80 hover:bg-white text-muted-foreground hover:text-forest-600 transition-colors shadow-sm"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer ${animal.name ?? animal.identifier} ?`)) {
                        deleteMutation.mutate(animal.id);
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/80 hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vue liste */
        <div className="lftg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Animal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Espèce</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sexe / Âge</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Enclos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">CITES</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((animal: any) => {
                const statusCfg = STATUS_CONFIG[animal.status] ?? STATUS_CONFIG.alive;
                const emoji = getAnimalEmoji(animal.species);
                const age = animal.birthDate
                  ? Math.floor((Date.now() - new Date(animal.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
                  : null;
                return (
                  <tr key={animal.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{emoji}</span>
                        <div>
                          <p className="font-semibold text-foreground">{animal.name ?? animal.identifier}</p>
                          <p className="text-xs text-muted-foreground font-mono">{animal.identifier}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{animal.species?.commonName ?? '—'}</p>
                      <p className="text-xs text-muted-foreground italic">{animal.species?.scientificName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`font-medium ${SEX_COLORS[animal.sex ?? ''] ?? 'text-gray-500'}`}>
                        {SEX_LABELS[animal.sex ?? ''] ?? '—'}
                      </p>
                      {age !== null && <p className="text-xs text-muted-foreground">{age} ans</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {animal.enclosure?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium w-fit ${statusCfg.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {animal.species?.citesStatus && animal.species.citesStatus !== 'Non listé' ? (
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${CITES_CONFIG[animal.species.citesStatus]?.color}`}>
                          {CITES_CONFIG[animal.species.citesStatus]?.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/animaux/${animal.id}`}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-forest-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setModal({ open: true, animal })}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-forest-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer ${animal.name ?? animal.identifier} ?`)) {
                              deleteMutation.mutate(animal.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
