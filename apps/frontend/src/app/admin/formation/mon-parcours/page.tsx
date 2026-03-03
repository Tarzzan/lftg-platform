'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  BookOpen, TrendingUp, Award, ChevronRight, CheckCircle,
  Star, Calendar, Play, Lock, Flame, Target, Zap, GraduationCap
} from 'lucide-react';
import { formationApi } from '@/lib/api';

// Anneau de progression animé avec gradient
function ProgressRing({ value, size = 80, strokeWidth = 7 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 100 ? '#16a34a' : value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#3b82f6';
  const trackColor = value >= 100 ? '#dcfce7' : value >= 70 ? '#f0fdf4' : value >= 40 ? '#fef3c7' : '#eff6ff';

  return (
    <svg width={size} height={size} className="-rotate-90" style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

// Badge de statut
function StatusBadge({ progress }: { progress: number }) {
  if (progress >= 100) return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-700">
      <CheckCircle className="w-3 h-3" /> Terminé
    </span>
  );
  if (progress >= 70) return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
      <Flame className="w-3 h-3" /> Bonne progression
    </span>
  );
  if (progress >= 30) return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gold-100 text-gold-700">
      <Zap className="w-3 h-3" /> En cours
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-maroni-100 text-maroni-700">
      <Play className="w-3 h-3" /> Débuté
    </span>
  );
}

// Carte de formation enrichie
function EnrollmentCard({ enrollment }: { enrollment: any }) {
  const router = useRouter();
  const course = enrollment?.cohort?.course;
  const progress = enrollment?.progress || 0;
  const chapters = course?.chapters || [];
  const totalLessons = chapters.flatMap((c: any) => c.lessons || []).length;
  const completedLessons = Math.round((progress / 100) * totalLessons);
  const daysLeft = enrollment?.cohort?.endDate
    ? Math.max(0, Math.ceil((new Date(enrollment.cohort.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div
      className="lftg-card overflow-hidden hover:shadow-lftg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
      onClick={() => router.push(`/admin/formation/mon-parcours/${enrollment.id}`)}
    >
      {/* Barre de progression en haut */}
      <div className="h-1 bg-gray-100 overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ${
            progress >= 100 ? 'bg-forest-500' : progress >= 70 ? 'bg-green-500' : progress >= 40 ? 'bg-gold-500' : 'bg-maroni-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Anneau de progression */}
          <div className="relative flex-shrink-0">
            <ProgressRing value={progress} size={80} strokeWidth={7} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-gray-800 leading-none">{progress}%</span>
              {progress >= 100 && <span className="text-xs">🏆</span>}
            </div>
          </div>

          {/* Infos principales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 group-hover:text-forest-700 transition-colors leading-snug">
                  {course?.title || 'Formation'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{enrollment?.cohort?.name}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge progress={progress} />
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-forest-500 transition-all group-hover:translate-x-0.5" />
              </div>
            </div>

            {/* Méta-infos */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <BookOpen className="w-3.5 h-3.5 text-forest-500" />
                <span><strong className="text-gray-700">{completedLessons}</strong>/{totalLessons} leçons</span>
              </span>
              {chapters.length > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Target className="w-3.5 h-3.5 text-maroni-500" />
                  <span><strong className="text-gray-700">{chapters.length}</strong> chapitres</span>
                </span>
              )}
              {daysLeft !== null && progress < 100 && (
                <span className={`flex items-center gap-1.5 text-xs font-medium ${daysLeft <= 7 ? 'text-red-600' : 'text-gray-500'}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  {daysLeft === 0 ? 'Dernier jour !' : `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`}
                </span>
              )}
              {progress >= 100 && enrollment?.completedAt && (
                <span className="flex items-center gap-1.5 text-xs text-forest-600 font-medium">
                  <Award className="w-3.5 h-3.5" />
                  Terminé le {new Date(enrollment.completedAt).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>

            {/* Chapitres preview */}
            {chapters.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                {chapters.slice(0, 5).map((ch: any, i: number) => {
                  const chLessons = ch.lessons?.length || 0;
                  const chCompleted = Math.min(chLessons, Math.round((progress / 100) * totalLessons) - chapters.slice(0, i).reduce((s: number, c: any) => s + (c.lessons?.length || 0), 0));
                  const chProgress = chLessons > 0 ? Math.min(100, Math.round((chCompleted / chLessons) * 100)) : 0;
                  return (
                    <div key={ch.id} className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-100">
                      {chProgress >= 100
                        ? <CheckCircle className="w-3 h-3 text-forest-500" />
                        : chProgress > 0
                        ? <Play className="w-3 h-3 text-gold-500" />
                        : <Lock className="w-3 h-3 text-gray-300" />
                      }
                      <span className="text-xs text-gray-600 max-w-[80px] truncate">{ch.title}</span>
                    </div>
                  );
                })}
                {chapters.length > 5 && (
                  <span className="text-xs text-muted-foreground">+{chapters.length - 5}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Note du formateur */}
        {enrollment?.learnerNotes?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2">
            <Star className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-0.5">Message de votre formateur</p>
              <p className="text-sm text-gray-700 italic">"{enrollment.learnerNotes[0].content}"</p>
              <p className="text-xs text-gray-400 mt-1">— {enrollment.learnerNotes[0].author?.name}</p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 flex justify-end">
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            progress >= 100
              ? 'bg-forest-50 text-forest-700 group-hover:bg-forest-100'
              : 'bg-maroni-50 text-maroni-700 group-hover:bg-maroni-100'
          }`}>
            {progress >= 100 ? (
              <><Award className="w-3.5 h-3.5" /> Voir le certificat</>
            ) : progress > 0 ? (
              <><Play className="w-3.5 h-3.5" /> Reprendre</>
            ) : (
              <><Play className="w-3.5 h-3.5" /> Commencer</>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

// Bannière de bienvenue avec progression globale
function WelcomeBanner({ enrollments }: { enrollments: any[] }) {
  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
    : 0;
  const completed = enrollments.filter((e) => (e.progress || 0) >= 100).length;
  const inProgress = enrollments.filter((e) => (e.progress || 0) > 0 && (e.progress || 0) < 100).length;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-forest-700 via-forest-600 to-maroni-700 p-6 text-white jungle-overlay">
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-forest-200 text-sm font-medium">La Ferme Tropicale de Guyane</p>
            <h2 className="text-2xl font-display font-bold mt-1">Mon espace formation</h2>
            <p className="text-forest-100 text-sm mt-1">
              {enrollments.length} formation{enrollments.length > 1 ? 's' : ''} · {completed} terminée{completed > 1 ? 's' : ''} · {inProgress} en cours
            </p>
          </div>
          <div className="relative flex-shrink-0">
            <ProgressRing value={totalProgress} size={100} strokeWidth={8} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold">{totalProgress}%</span>
              <span className="text-xs text-forest-200">global</span>
            </div>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-forest-200 mb-1">
            <span>Progression globale</span>
            <span>{totalProgress}%</span>
          </div>
          <div className="h-2 bg-forest-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-forest-300 to-maroni-300 rounded-full transition-all duration-1000"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MonParcoursPage() {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => formationApi.myEnrollments(),
  });

  const list = enrollments as any[];
  const completed = list.filter((e) => (e.progress || 0) >= 100);
  const inProgress = list.filter((e) => (e.progress || 0) > 0 && (e.progress || 0) < 100);
  const notStarted = list.filter((e) => (e.progress || 0) === 0);

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-40 rounded-xl bg-muted animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
      </div>
      {[1, 2].map((i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
    </div>
  );

  if (list.length === 0) return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-600 to-forest-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Mon parcours de formation</h1>
            <p className="text-sm text-muted-foreground">La Ferme Tropicale de Guyane</p>
          </div>
        </div>
      </div>
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-forest-100 to-maroni-100 flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-10 h-10 text-forest-500" />
        </div>
        <h3 className="font-bold text-gray-800 text-lg">Aucune formation inscrite</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Contactez votre formateur ou responsable pédagogique pour vous inscrire à une cohorte de formation.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Bannière */}
      <WelcomeBanner enrollments={list} />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="lftg-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroni-50 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-maroni-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{list.length}</p>
            <p className="text-xs text-gray-500">Formation{list.length > 1 ? 's' : ''} inscrite{list.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="lftg-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{inProgress.length}</p>
            <p className="text-xs text-gray-500">En cours</p>
          </div>
        </div>
        <div className="lftg-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-forest-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{completed.length}</p>
            <p className="text-xs text-gray-500">Terminée{completed.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* En cours */}
      {inProgress.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-gold-500" /> En cours ({inProgress.length})
          </h2>
          {inProgress.map((e: any) => <EnrollmentCard key={e.id} enrollment={e} />)}
        </div>
      )}

      {/* Non démarrées */}
      {notStarted.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Play className="w-4 h-4 text-maroni-500" /> À démarrer ({notStarted.length})
          </h2>
          {notStarted.map((e: any) => <EnrollmentCard key={e.id} enrollment={e} />)}
        </div>
      )}

      {/* Terminées */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-forest-500" /> Terminées ({completed.length})
          </h2>
          {completed.map((e: any) => <EnrollmentCard key={e.id} enrollment={e} />)}
        </div>
      )}
    </div>
  );
}
