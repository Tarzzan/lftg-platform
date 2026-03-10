'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Clock, Trophy, Star, ChevronRight, Play,
  CheckCircle, Lock, Flame, TrendingUp, Award, Zap,
  GraduationCap, Target, Leaf
} from 'lucide-react';
import { formationApi } from '@/lib/api';

// ─── Mascotte Capi animée ──────────────────────────────────────────────────────
function CapiMascot({ mood = 'happy', size = 80 }: { mood?: 'happy' | 'excited' | 'thinking'; size?: number }) {
  const expressions = {
    happy: { eyes: '◉ ◉', mouth: '‿', color: '#c17f3a', anim: 'animate-bounce' },
    excited: { eyes: '★ ★', mouth: '▽', color: '#e8a84e', anim: 'animate-pulse' },
    thinking: { eyes: '◑ ◐', mouth: '~', color: '#2d7d7d', anim: '' },
  };
  const expr = expressions[mood];

  return (
    <div className={`relative inline-flex flex-col items-center ${expr.anim}`} style={{ width: size, height: size * 1.2 }}>
      <svg viewBox="0 0 100 120" width={size} height={size * 1.2} xmlns="http://www.w3.org/2000/svg">
        {/* Corps */}
        <ellipse cx="50" cy="80" rx="28" ry="32" fill="#8B6914" />
        {/* Ventre */}
        <ellipse cx="50" cy="82" rx="18" ry="22" fill="#D4A853" />
        {/* Tête */}
        <circle cx="50" cy="42" r="28" fill="#8B6914" />
        {/* Calotte blanche/olive caractéristique du capucin */}
        <ellipse cx="50" cy="28" rx="20" ry="14" fill="#C8B860" />
        {/* Masque facial */}
        <ellipse cx="50" cy="46" rx="16" ry="14" fill="#D4A853" />
        {/* Oreilles */}
        <circle cx="24" cy="38" r="9" fill="#8B6914" />
        <circle cx="76" cy="38" r="9" fill="#8B6914" />
        <circle cx="24" cy="38" r="5" fill="#D4A853" />
        <circle cx="76" cy="38" r="5" fill="#D4A853" />
        {/* Yeux */}
        <circle cx="42" cy="42" r="5" fill="#1a1a1a" />
        <circle cx="58" cy="42" r="5" fill="#1a1a1a" />
        <circle cx="43" cy="41" r="1.5" fill="white" />
        <circle cx="59" cy="41" r="1.5" fill="white" />
        {/* Nez */}
        <ellipse cx="50" cy="50" rx="4" ry="3" fill="#5C3D11" />
        {/* Sourire */}
        {mood === 'happy' && <path d="M 42 56 Q 50 63 58 56" stroke="#5C3D11" strokeWidth="2" fill="none" strokeLinecap="round" />}
        {mood === 'excited' && <path d="M 40 55 Q 50 65 60 55" stroke="#5C3D11" strokeWidth="2.5" fill="#D4A853" strokeLinecap="round" />}
        {mood === 'thinking' && <path d="M 44 57 Q 50 55 56 57" stroke="#5C3D11" strokeWidth="2" fill="none" strokeLinecap="round" />}
        {/* Queue enroulée */}
        <path d="M 78 90 Q 95 80 92 65 Q 89 50 82 55 Q 78 58 82 62" stroke="#8B6914" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Bras gauche levé */}
        <path d="M 22 72 Q 10 55 18 48" stroke="#8B6914" strokeWidth="7" fill="none" strokeLinecap="round" />
        <circle cx="18" cy="48" r="5" fill="#D4A853" />
        {/* Bras droit */}
        <path d="M 78 72 Q 88 78 85 88" stroke="#8B6914" strokeWidth="7" fill="none" strokeLinecap="round" />
        <circle cx="85" cy="88" r="5" fill="#D4A853" />
        {/* Jambes */}
        <path d="M 38 108 Q 34 118 30 120" stroke="#8B6914" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M 62 108 Q 66 118 70 120" stroke="#8B6914" strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* Accessoire : petite feuille */}
        <path d="M 60 20 Q 70 10 75 18 Q 68 22 60 20" fill="#2d7d7d" />
      </svg>
    </div>
  );
}

// ─── Composant carte de cours ─────────────────────────────────────────────────
function CourseProgressCard({ enrollment }: { enrollment: any }) {
  const router = useRouter();
  const progress = enrollment.progress ?? 0;
  const isCompleted = progress >= 100;
  const isInProgress = progress > 0 && progress < 100;

  const getStatusColor = () => {
    if (isCompleted) return { bg: 'from-forest-500 to-emerald-600', badge: 'bg-forest-100 text-forest-700' };
    if (isInProgress) return { bg: 'from-[#c17f3a] to-[#e8a84e]', badge: 'bg-amber-100 text-amber-700' };
    return { bg: 'from-[#2d7d7d] to-[#3a9b9b]', badge: 'bg-teal-100 text-teal-700' };
  };

  const colors = getStatusColor();

  return (
    <div
      className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: 'white',
        border: '1px solid rgba(26,71,49,0.1)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
      onClick={() => router.push(`/admin/formation/mon-parcours/${enrollment.id}`)}
    >
      {/* Image de fond / header coloré */}
      <div
        className={`relative h-28 bg-gradient-to-br ${colors.bg} overflow-hidden`}
      >
        {enrollment.course?.coverImage && (
          <img
            src={enrollment.course.coverImage}
            alt={enrollment.course.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
          />
        )}
        {/* Overlay motif */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20 Z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Barre de progression en haut */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
          <div
            className="h-full bg-white/80 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Badge statut */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.badge}`}>
            {isCompleted ? '✓ Terminé' : isInProgress ? `${progress}%` : 'Nouveau'}
          </span>
        </div>
        {/* Icône */}
        <div className="absolute bottom-4 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {isCompleted ? (
            <Trophy className="w-5 h-5 text-white" />
          ) : isInProgress ? (
            <Play className="w-5 h-5 text-white" />
          ) : (
            <BookOpen className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-2 group-hover:text-forest-700 transition-colors">
          {enrollment.course?.title || 'Formation'}
        </h3>

        {/* Progression */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-gray-400">Progression</span>
            <span className="text-[10px] font-bold text-gray-600">{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${colors.bg}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Infos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            {enrollment.course?.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {enrollment.course.duration}h
              </span>
            )}
            {enrollment.course?.level && (
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {enrollment.course.level}
              </span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-forest-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}

// ─── Composant stat ───────────────────────────────────────────────────────────
function StatBubble({ icon: Icon, value, label, color }: { icon: any; value: string | number; label: string; color: string }) {
  return (
    <div
      className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-105"
      style={{
        background: 'white',
        border: '1px solid rgba(26,71,49,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: `${color}15` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <span className="text-2xl font-black" style={{ color }}>{value}</span>
      <span className="text-[10px] text-gray-500 text-center font-medium">{label}</span>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function MonParcoursPage() {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all');

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => formationApi.getMyEnrollments(),
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['my-badges'],
    queryFn: () => formationApi.getMyBadges(),
  });

  const { data: stats } = useQuery({
    queryKey: ['my-stats'],
    queryFn: () => formationApi.getMyStats(),
  });

  const completed = enrollments.filter((e: any) => (e.progress ?? 0) >= 100).length;
  const inProgress = enrollments.filter((e: any) => (e.progress ?? 0) > 0 && (e.progress ?? 0) < 100).length;
  const notStarted = enrollments.filter((e: any) => (e.progress ?? 0) === 0).length;
  const totalHours = enrollments.reduce((acc: number, e: any) => acc + (e.course?.duration ?? 0), 0);

  const filtered = enrollments.filter((e: any) => {
    const p = e.progress ?? 0;
    if (filter === 'completed') return p >= 100;
    if (filter === 'in_progress') return p > 0 && p < 100;
    if (filter === 'not_started') return p === 0;
    return true;
  });

  // Humeur de Capi selon la progression
  const capiMood = completed > 0 ? 'excited' : inProgress > 0 ? 'happy' : 'thinking';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f5f2ed 0%, #f0ede8 100%)' }}>

      {/* ─── Hero banner avec mascotte ─── */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 p-6"
        style={{
          background: 'linear-gradient(135deg, #0d2b1a 0%, #1a4731 50%, #2d7d7d 100%)',
          boxShadow: '0 8px 32px rgba(13,43,26,0.3)',
        }}
      >
        {/* Motif de fond */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative flex items-center gap-6">
          {/* Mascotte Capi */}
          <div className="flex-shrink-0 hidden sm:block">
            <CapiMascot mood={capiMood} size={90} />
          </div>

          {/* Texte */}
          <div className="flex-1">
            <h1
              className="text-2xl font-black text-white mb-1"
              style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              Mon Parcours de Formation
            </h1>
            <p className="text-white/70 text-sm mb-4">
              {completed > 0
                ? `Bravo ! Tu as terminé ${completed} formation${completed > 1 ? 's' : ''}. Continue comme ça ! 🎉`
                : inProgress > 0
                ? `Tu as ${inProgress} formation${inProgress > 1 ? 's' : ''} en cours. Capi t'encourage ! 💪`
                : 'Commence ta première formation et débloque des badges exclusifs ! 🌿'}
            </p>

            {/* Barre de progression globale */}
            {enrollments.length > 0 && (
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>Progression globale</span>
                  <span>{Math.round((completed / enrollments.length) * 100)}% terminé</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.round((completed / enrollments.length) * 100)}%`,
                      background: 'linear-gradient(90deg, #c17f3a, #e8a84e)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stats rapides */}
          <div className="hidden lg:flex flex-col gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span><strong className="text-white">{completed}</strong> terminée{completed > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Flame className="w-4 h-4 text-amber-400" />
              <span><strong className="text-white">{inProgress}</strong> en cours</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Award className="w-4 h-4 text-[#e8a84e]" />
              <span><strong className="text-white">{badges.length}</strong> badge{badges.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats bulles ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatBubble icon={BookOpen} value={enrollments.length} label="Formations inscrites" color="#1a4731" />
        <StatBubble icon={CheckCircle} value={completed} label="Terminées" color="#059669" />
        <StatBubble icon={Flame} value={inProgress} label="En cours" color="#c17f3a" />
        <StatBubble icon={Clock} value={`${totalHours}h`} label="Heures de formation" color="#2d7d7d" />
      </div>

      {/* ─── Filtres ─── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { key: 'all', label: `Tout (${enrollments.length})`, icon: GraduationCap },
          { key: 'in_progress', label: `En cours (${inProgress})`, icon: Flame },
          { key: 'completed', label: `Terminées (${completed})`, icon: Trophy },
          { key: 'not_started', label: `À commencer (${notStarted})`, icon: Leaf },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all hover:scale-[1.02]"
            style={filter === key ? {
              background: 'linear-gradient(135deg, #1a4731, #2d7d7d)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(26,71,49,0.3)',
            } : {
              background: 'white',
              color: '#1a4731',
              border: '1px solid rgba(26,71,49,0.15)',
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Grille de cours ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
              <div className="h-28 bg-gray-200" />
              <div className="p-4 bg-white space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-2 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CapiMascot mood="thinking" size={100} />
          <h3 className="mt-4 text-lg font-bold text-gray-700">Aucune formation ici</h3>
          <p className="text-sm text-gray-400 mt-1">
            {filter === 'all'
              ? "Tu n'es inscrit à aucune formation pour l'instant."
              : `Aucune formation dans cette catégorie.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((enrollment: any) => (
            <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}
