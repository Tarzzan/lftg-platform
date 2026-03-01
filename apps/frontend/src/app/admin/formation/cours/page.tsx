'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, BookOpen, Clock, Users, Edit2, Trash2, Download, Filter } from 'lucide-react';
import { formationApi, exportApi } from '@/lib/api';
import { CourseModal } from '@/components/modals/CourseModal';

const LEVEL_CLASSES: Record<string, string> = {
  'débutant': 'bg-forest-100 text-forest-700',
  'intermédiaire': 'bg-gold-100 text-gold-700',
  'avancé': 'bg-laterite-100 text-laterite-700',
};

const CATEGORIES = ['Tous', 'Soins animaliers', 'Sécurité', 'Gestion de stock', 'Réglementation', 'Premiers secours', 'Autre'];

export default function FormationCoursPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [modal, setModal] = useState<{ open: boolean; course?: any }>({ open: false });

  const { data: courses = [], isLoading } = useQuery({
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Catalogue de formations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {(courses as any[]).length} formation{(courses as any[]).length !== 1 ? 's' : ''} · {publishedCount} publiée{publishedCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={exportApi.formationCsv()}
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
            Nouvelle formation
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="lftg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  category === cat ? 'bg-forest-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'published', label: 'Publiés' },
              { key: 'draft', label: 'Brouillons' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setPublishedFilter(f.key as any)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  publishedFilter === f.key ? 'bg-maroni-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course grid */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
          Aucune formation trouvée
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course: any) => (
            <div key={course.id} className="lftg-card p-5 hover:shadow-md transition-shadow group flex flex-col">
              {/* Thumbnail or placeholder */}
              <div className="w-full h-32 rounded-xl bg-gradient-to-br from-forest-100 to-maroni-100 flex items-center justify-center mb-4 overflow-hidden">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-10 h-10 text-forest-400" />
                )}
              </div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground text-sm leading-snug flex-1">{course.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  course.isPublished ? 'bg-forest-100 text-forest-700' : 'bg-muted text-muted-foreground'
                }`}>
                  {course.isPublished ? 'Publié' : 'Brouillon'}
                </span>
              </div>

              {course.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                {course.level && (
                  <span className={`px-2 py-0.5 rounded-full font-medium ${LEVEL_CLASSES[course.level] ?? 'bg-muted text-muted-foreground'}`}>
                    {course.level}
                  </span>
                )}
                {course.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.duration < 60 ? `${course.duration} min` : `${Math.round(course.duration / 60)}h`}
                  </span>
                )}
                {course._count?.cohorts !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course._count.cohorts} cohorte{course._count.cohorts !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {course.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {course.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setModal({ open: true, course })}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Modifier
                </button>
                <button
                  onClick={() => { if (confirm(`Supprimer "${course.title}" ?`)) deleteMutation.mutate(course.id); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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
