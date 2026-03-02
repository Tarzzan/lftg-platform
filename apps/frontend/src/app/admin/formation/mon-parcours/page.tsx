'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Clock, TrendingUp, Award, ChevronRight, Play,
  CheckCircle, Lock, Star, Calendar, Users
} from 'lucide-react';
import { formationApi } from '@/lib/api';

function ProgressRing({ value, size = 64, strokeWidth = 5 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={value >= 80 ? '#16a34a' : value >= 50 ? '#f59e0b' : '#3b82f6'}
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

function EnrollmentCard({ enrollment }: { enrollment: any }) {
  const router = useRouter();
  const course = enrollment?.cohort?.course;
  const progress = enrollment?.progress || 0;
  const totalLessons = course?.chapters?.flatMap((c: any) => c.lessons)?.length || 0;
  const completedLessons = Math.round((progress / 100) * totalLessons);

  const statusColor = progress >= 80 ? 'text-green-600' : progress >= 50 ? 'text-amber-600' : 'text-blue-600';
  const statusLabel = progress >= 100 ? 'Terminé' : progress >= 50 ? 'En cours' : 'Débuté';

  return (
    <div
      className="lftg-card p-5 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => router.push(`/admin/formation/mon-parcours/${enrollment.id}`)}
    >
      <div className="flex items-start gap-4">
        {/* Progress Ring */}
        <div className="relative flex-shrink-0">
          <ProgressRing value={progress} size={72} strokeWidth={6} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-700">{progress}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-800 group-hover:text-forest-700 transition-colors">{course?.title || 'Formation'}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{enrollment?.cohort?.name}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-forest-500 transition-colors flex-shrink-0 mt-0.5" />
          </div>

          <div className="flex items-center gap-4 mt-3">
            <span className={`flex items-center gap-1 text-xs font-medium ${statusColor}`}>
              <CheckCircle className="w-3.5 h-3.5" />
              {statusLabel}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <BookOpen className="w-3.5 h-3.5" />
              {completedLessons}/{totalLessons} leçons
            </span>
            {enrollment?.cohort?.endDate && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                Fin : {new Date(enrollment.cohort.endDate).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Notes du formateur */}
      {enrollment?.learnerNotes?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            Message de votre formateur
          </p>
          <p className="text-sm text-gray-700 italic">"{enrollment.learnerNotes[0].content}"</p>
          <p className="text-xs text-gray-400 mt-1">— {enrollment.learnerNotes[0].author?.name}</p>
        </div>
      )}
    </div>
  );
}

export default function MonParcoursPage() {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => formationApi.myEnrollments(),
  });

  const totalProgress = (enrollments as any[]).length > 0
    ? Math.round((enrollments as any[]).reduce((s: number, e: any) => s + (e.progress || 0), 0) / (enrollments as any[]).length)
    : 0;

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mon parcours de formation</h1>
          <p className="text-sm text-muted-foreground">La Ferme Tropicale de Guyane — Espace apprenant</p>
        </div>
      </div>

      {/* Stats globales */}
      {(enrollments as any[]).length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="lftg-card p-4 text-center">
            <BookOpen className="w-6 h-6 text-forest-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{(enrollments as any[]).length}</p>
            <p className="text-xs text-gray-500">Formation{(enrollments as any[]).length > 1 ? 's' : ''} inscrite{(enrollments as any[]).length > 1 ? 's' : ''}</p>
          </div>
          <div className="lftg-card p-4 text-center">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{totalProgress}%</p>
            <p className="text-xs text-gray-500">Progression globale</p>
          </div>
          <div className="lftg-card p-4 text-center">
            <Award className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{(enrollments as any[]).filter((e: any) => (e.progress || 0) >= 100).length}</p>
            <p className="text-xs text-gray-500">Formation{(enrollments as any[]).filter((e: any) => (e.progress || 0) >= 100).length > 1 ? 's' : ''} terminée{(enrollments as any[]).filter((e: any) => (e.progress || 0) >= 100).length > 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Formations */}
      {(enrollments as any[]).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">Vous n'êtes inscrit à aucune formation</p>
          <p className="text-sm mt-1">Contactez votre formateur pour vous inscrire à une cohorte.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(enrollments as any[]).map((enrollment: any) => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}
