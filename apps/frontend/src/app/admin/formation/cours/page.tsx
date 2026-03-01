'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, Plus, Users, Layers } from 'lucide-react';
import { formationApi } from '@/lib/api';

export default function CoursPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => formationApi.courses(),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cours & Formations</h1>
          <p className="text-sm text-muted-foreground mt-1">{courses?.length ?? 0} cours</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nouveau cours
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(courses || []).map((course: any) => (
            <div key={course.id} className="lftg-card p-5 hover:shadow-lftg-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-maroni-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-maroni-700" />
                </div>
                <span className={`lftg-badge ${course.isPublished ? 'badge-approved' : 'badge-draft'}`}>
                  {course.isPublished ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{course.title}</h3>
              {course.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {course._count?.chapters ?? 0} chapitres
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {course._count?.cohorts ?? 0} cohortes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && courses?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucun cours créé</p>
        </div>
      )}
    </div>
  );
}
