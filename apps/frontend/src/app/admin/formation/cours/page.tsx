'use client';
import { toast } from 'sonner';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, BookOpen, Clock, Users, Edit2, Trash2, Download,
  Filter, GraduationCap, TrendingUp, Eye, EyeOff, ChevronRight,
  Layers, Award, Sparkles
} from 'lucide-react';
import { formationApi, exportApi } from '@/lib/api';
import { CourseModal } from '@/components/modals/CourseModal';

const LEVEL_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  'débutant':      { label: 'Débutant',      color: 'bg-forest-100 text-forest-700',   dot: 'bg-forest-500' },
  'intermédiaire': { label: 'Intermédiaire', color: 'bg-gold-100 text-gold-700',       dot: 'bg-gold-500' },
  'avancé':        { label: 'Avancé',        color: 'bg-laterite-100 text-laterite-700', dot: 'bg-laterite-500' },
};

const CATEGORY_ICONS: Record<string, string> = {
  'Soins animaliers': '🦜',
  'Sécurité': '🛡️',
  'Gestion de stock': '📦',
  'Réglementation': '⚖️',
  'Premiers secours': '🩺',
  'Autre': '📚',
  'Tous': '✨',
};

const CATEGORIES = ['Tous', 'Soins animaliers', 'Sécurité', 'Gestion de stock', 'Réglementation', 'Premiers secours', 'Autre'];

// Dégradés par catégorie pour les thumbnails
const CATEGORY_GRADIENTS: Record<string, string> = {
  'Soins animaliers': 'from-forest-600 to-forest-400',
  'Sécurité': 'from-laterite-600 to-gold-400',
  'Gestion de stock': 'from-maroni-700 to-maroni-400',
  'Réglementation': 'from-wood-700 to-wood-500',
  'Premiers secours': 'from-red-600 to-red-400',
  'Autre': 'from-forest-700 to-maroni-500',
};

function CourseCard({ course, onEdit, onDelete }: { course: any; onEdit: () => void; onDelete: () => void }) {
  const router = useRouter();
  const levelConfig = LEVEL_CONFIG[course.level] || null;
  const gradient = CATEGORY_GRADIENTS[course.category] || 'from-forest-700 to-maroni-500';
  const emoji = CATEGORY_ICONS[course.category] || '📚';
  const totalLessons = course.chapters?.flatMap((c: any) => c.lessons)?.length ?? (course._count?.lessons ?? 0);

  return (
    <div className="lftg-card overflow-hidden flex flex-col group hover:shadow-lftg transition-all duration-300 hover:-translate-y-0.5">
      {/* Thumbnail */}
      <div
        className={`relative h-36 bg-gradient-to-br ${gradient} cursor-pointer overflow-hidden`}
        onClick={() => router.push(`/admin/formation/cours/${course.id}`)}
      >
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl filter drop-shadow-sm">{emoji}</span>
            <span className="text-white/70 text-xs font-medium uppercase tracking-wider">{course.category || 'Formation'}</span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
            course.isPublished
              ? 'bg-forest-500/90 text-white'
              : 'bg-black/40 text-white/80'
          }`}>
            {course.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {course.isPublished ? 'Publié' : 'Brouillon'}
          </span>
        </div>
        {/* Chapters count */}
        {course.chapters?.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/40 text-white backdrop-blur-sm">
              <Layers className="w-3 h-3" />
              {course.chapters.length} chapitre{course.chapters.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
        {/* Arrow on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3
            className="font-semibold text-foreground text-sm leading-snug cursor-pointer hover:text-forest-700 transition-colors"
            onClick={() => router.push(`/admin/formation/cours/${course.id}`)}
          >
            {course.title}
          </h3>
          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">{course.description}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {levelConfig && (
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${levelConfig.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${levelConfig.dot}`} />
              {levelConfig.label}
            </span>
          )}
          {course.duration && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {course.duration < 60 ? `${course.duration} min` : `${Math.floor(course.duration / 60)}h${course.duration % 60 > 0 ? `${course.duration % 60}` : ''}`}
            </span>
          )}
          {totalLessons > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="w-3 h-3" />
              {totalLessons} leçon{totalLessons > 1 ? 's' : ''}
            </span>
          )}
          {course._count?.cohorts !== undefined && course._count.cohorts > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {course._count.cohorts} cohorte{course._count.cohorts > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Tags */}
        {course.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {course.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-border">
          <button
            onClick={() => router.push(`/admin/formation/cours/${course.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-forest-700 bg-forest-50 rounded-lg hover:bg-forest-100 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" /> Programme
          </button>
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FormationCoursPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [modal, setModal] = useState<{ open: boolean; course?: any }>({ open: false });

  const { data: courses = [], isLoading, isError, error } = useQuery({
    queryKey: ['courses'],
    queryFn: () => formationApi.courses(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => formationApi.deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });

  const filtered = useMemo(() => {
    let list = courses as any[];
    if (search) list = list.filter((c: any) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? '').toLowerCase().includes(search.toLowerCase())
    );
    if (category !== 'Tous') list = list.filter((c: any) => c.category === category);
    if (publishedFilter === 'published') list = list.filter((c: any) => c.isPublished);
    if (publishedFilter === 'draft') list = list.filter((c: any) => !c.isPublished);
    return list;
  }, [courses, search, category, publishedFilter]);

  const publishedCount = (courses as any[]).filter((c: any) => c.isPublished).length;
  const draftCount = (courses as any[]).length - publishedCount;
  const totalLessons = (courses as any[]).reduce((s: number, c: any) =>
    s + (c.chapters?.flatMap((ch: any) => ch.lessons)?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-600 to-forest-400 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Catalogue de formations</h1>
            <p className="text-sm text-muted-foreground">
              {(courses as any[]).length} formation{(courses as any[]).length !== 1 ? 's' : ''} · {publishedCount} publiée{publishedCount !== 1 ? 's' : ''} · {draftCount} brouillon{draftCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={exportApi.formationCsv()}
            download
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </a>
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle formation
          </button>
        </div>
      </div>

      {/* KPI rapides */}
      <div className="grid grid-cols-4 gap-4">
        <div className="lftg-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-forest-50 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4.5 h-4.5 text-forest-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{(courses as any[]).length}</p>
            <p className="text-xs text-muted-foreground">Formations</p>
          </div>
        </div>
        <div className="lftg-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-maroni-50 flex items-center justify-center flex-shrink-0">
            <Layers className="w-4.5 h-4.5 text-maroni-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{totalLessons}</p>
            <p className="text-xs text-muted-foreground">Leçons</p>
          </div>
        </div>
        <div className="lftg-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <Eye className="w-4.5 h-4.5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{publishedCount}</p>
            <p className="text-xs text-muted-foreground">Publiées</p>
          </div>
        </div>
        <div className="lftg-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-gold-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{draftCount}</p>
            <p className="text-xs text-muted-foreground">Brouillons</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="lftg-card p-4 space-y-3">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par titre ou description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-shadow"
          />
        </div>
        {/* Catégories */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Catégorie :
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                category === cat
                  ? 'bg-forest-600 text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
        {/* Statut */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1">Statut :</span>
          {[
            { key: 'all', label: 'Tous', icon: BookOpen },
            { key: 'published', label: 'Publiés', icon: Eye },
            { key: 'draft', label: 'Brouillons', icon: EyeOff },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setPublishedFilter(f.key as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                publishedFilter === f.key
                  ? 'bg-maroni-600 text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <f.icon className="w-3 h-3" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de cours */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="lftg-card overflow-hidden animate-pulse">
              <div className="h-36 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <p className="font-semibold text-foreground">Aucune formation trouvée</p>
          <p className="text-sm text-muted-foreground mt-1">Modifiez vos filtres ou créez une nouvelle formation</p>
          <button
            onClick={() => setModal({ open: true })}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" /> Créer une formation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course: any) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => setModal({ open: true, course })}
              onDelete={() => { if (confirm(`Supprimer "${course.title}" ?`)) deleteMutation.mutate(course.id); }}
            />
          ))}
        </div>
      )}

      <CourseModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false })}
        course={modal.course}
      />
    </div>
  );
}
