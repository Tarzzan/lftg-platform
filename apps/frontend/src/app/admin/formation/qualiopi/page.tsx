'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Award, Users, TrendingUp, CheckCircle, FileSignature,
  BookOpen, AlertTriangle, Download, ChevronDown, ChevronRight,
  Star, Target, BarChart3, Shield, Zap, Clock, PenLine,
  GraduationCap, Activity, Info
} from 'lucide-react';
import { formationApi } from '@/lib/api';

// ─── Indicateurs Qualiopi ─────────────────────────────────────────────────────
const QUALIOPI_INDICATORS = [
  {
    id: 'I10', label: 'Indicateur 10', title: 'Suivi de l\'assiduité',
    description: 'Feuilles d\'émargement numériques signées par les apprenants et les formateurs',
    icon: FileSignature, color: 'blue', criterion: 'Critère 3',
  },
  {
    id: 'I11', label: 'Indicateur 11', title: 'Suivi de la progression',
    description: 'Progression individuelle par leçon, temps passé et résultats aux évaluations',
    icon: TrendingUp, color: 'green', criterion: 'Critère 3',
  },
  {
    id: 'I12', label: 'Indicateur 12', title: 'Engagement des apprenants',
    description: 'Taux de complétion, quiz, interactions avec les supports pédagogiques',
    icon: Target, color: 'purple', criterion: 'Critère 3',
  },
  {
    id: 'I13', label: 'Indicateur 13', title: 'Accompagnement pédagogique',
    description: 'Notes de suivi individualisées par le formateur, alertes décrochage',
    icon: Star, color: 'amber', criterion: 'Critère 4',
  },
  {
    id: 'I14', label: 'Indicateur 14', title: 'Ressources pédagogiques',
    description: 'Diversité des supports : PDF, vidéo, présentations, contenus interactifs',
    icon: BookOpen, color: 'teal', criterion: 'Critère 4',
  },
  {
    id: 'I16', label: 'Indicateur 16', title: 'Gestion des abandons',
    description: 'Identification des apprenants à risque (progression < 30%, absences)',
    icon: AlertTriangle, color: 'red', criterion: 'Critère 5',
  },
];

// ─── Anneau de score ──────────────────────────────────────────────────────────
function ScoreRing({ value, size = 56, isRisk = false }: { value: number; size?: number; isRisk?: boolean }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, value) / 100) * circumference;
  const color = isRisk
    ? (value > 0 ? '#ef4444' : '#22c55e')
    : value >= 80 ? '#16a34a' : value >= 60 ? '#f59e0b' : '#3b82f6';

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

// ─── Carte indicateur ─────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100',   badge: 'bg-blue-100 text-blue-700' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100',  badge: 'bg-green-100 text-green-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', badge: 'bg-purple-100 text-purple-700' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100',  badge: 'bg-amber-100 text-amber-700' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-100',   badge: 'bg-teal-100 text-teal-700' },
  red:    { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-100',    badge: 'bg-red-100 text-red-700' },
};

function IndicatorCard({ indicator, data }: { indicator: typeof QUALIOPI_INDICATORS[0]; data: any }) {
  const c = COLOR_MAP[indicator.color] || COLOR_MAP.blue;
  const isRisk = indicator.id === 'I16';

  const getScore = (): number => {
    if (!data) return 0;
    const stats = data.enrollmentStats || [];
    const total = stats.length || 1;
    switch (indicator.id) {
      case 'I10': return data.attendanceRate || 0;
      case 'I11': return Math.round(stats.reduce((s: number, e: any) => s + (e.progress || 0), 0) / total);
      case 'I12': return Math.round((stats.filter((e: any) => e.quizScore !== null).length / total) * 100);
      case 'I13': return Math.round((stats.filter((e: any) => e.notesCount > 0).length / total) * 100);
      case 'I14': return 100;
      case 'I16': return stats.filter((e: any) => (e.progress || 0) < 30).length;
      default: return 0;
    }
  };

  const score = getScore();
  const displayScore = isRisk ? score : `${score}%`;
  const status = isRisk
    ? (score === 0 ? 'Conforme' : `${score} à risque`)
    : score >= 80 ? 'Excellent' : score >= 60 ? 'Satisfaisant' : 'À améliorer';
  const statusColor = isRisk
    ? (score === 0 ? 'text-green-600' : 'text-red-600')
    : score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className={`lftg-card p-5 border ${c.border} hover:shadow-sm transition-all`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
            <indicator.icon className={`w-5 h-5 ${c.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{indicator.label}</span>
              <span className="text-xs text-gray-400">{indicator.criterion}</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">{indicator.title}</h3>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <ScoreRing value={isRisk ? (score === 0 ? 100 : 0) : score} size={52} isRisk={isRisk} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold ${isRisk && score > 0 ? 'text-red-600' : 'text-gray-700'}`}>
              {displayScore}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{indicator.description}</p>

      {!isRisk && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ${
              score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      )}

      <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusColor}`}>
        {(isRisk ? score === 0 : score >= 80)
          ? <CheckCircle className="w-3.5 h-3.5" />
          : <AlertTriangle className="w-3.5 h-3.5" />
        }
        {status}
      </div>
    </div>
  );
}

// ─── Ligne apprenant ──────────────────────────────────────────────────────────
function LearnerRow({ stat }: { stat: any }) {
  const [expanded, setExpanded] = useState(false);
  const isAtRisk = (stat.progress || 0) < 30;
  const progress = stat.progress || 0;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isAtRisk ? 'border-red-200 bg-red-50/20' : 'border-gray-100 bg-white'
    }`}>
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0 ${
          isAtRisk
            ? 'bg-gradient-to-br from-red-400 to-red-600'
            : 'bg-gradient-to-br from-forest-400 to-forest-600'
        }`}>
          {stat.user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-800 text-sm">{stat.user?.name || 'Apprenant inconnu'}</p>
            {isAtRisk && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                <AlertTriangle className="w-3 h-3" /> Décrochage
              </span>
            )}
            {progress >= 100 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-forest-100 text-forest-700 text-xs rounded-full font-semibold">
                <Award className="w-3 h-3" /> Terminé
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{stat.user?.email}</p>
        </div>

        {/* Métriques */}
        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="text-center hidden sm:block">
            <p className={`text-lg font-bold ${isAtRisk ? 'text-red-600' : 'text-gray-800'}`}>{progress}%</p>
            <p className="text-xs text-gray-400">Progression</p>
          </div>
          <div className="text-center hidden md:block">
            <p className="text-lg font-bold text-gray-800">{stat.signaturesCount || 0}</p>
            <p className="text-xs text-gray-400">Émargements</p>
          </div>
          <div className="text-center hidden md:block">
            <p className="text-lg font-bold text-gray-800">
              {stat.quizScore !== null && stat.quizScore !== undefined ? `${stat.quizScore}%` : '—'}
            </p>
            <p className="text-xs text-gray-400">Quiz</p>
          </div>
          <div className="text-center hidden lg:block">
            <p className="text-lg font-bold text-gray-800">{stat.notesCount || 0}</p>
            <p className="text-xs text-gray-400">Notes</p>
          </div>
          {expanded
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronRight className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/30">
          <div className="mt-3 space-y-3">
            {/* Barre de progression */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progression des leçons</span>
                <span className="font-medium">{stat.completedLessons || 0}/{stat.totalLessons || 0} leçons</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    isAtRisk ? 'bg-red-500' : progress >= 80 ? 'bg-forest-500' : 'bg-gold-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Détails */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-card rounded-lg border border-gray-100">
                <PenLine className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-700">{stat.signaturesCount || 0}</p>
                  <p className="text-xs text-gray-400">Émargements</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-card rounded-lg border border-gray-100">
                <Target className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-700">
                    {stat.quizScore !== null && stat.quizScore !== undefined ? `${stat.quizScore}%` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400">Score quiz</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-card rounded-lg border border-gray-100">
                <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-700">{stat.notesCount || 0}</p>
                  <p className="text-xs text-gray-400">Notes formateur</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-card rounded-lg border border-gray-100">
                <Clock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-700">
                    {stat.timeSpent ? `${Math.round(stat.timeSpent / 60)}h` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400">Temps passé</p>
                </div>
              </div>
            </div>

            {isAtRisk && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-700">Action requise — Risque de décrochage</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Progression inférieure à 30%. Contactez cet apprenant pour un entretien de suivi (Qualiopi I16).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Score global Qualiopi ────────────────────────────────────────────────────
function GlobalQualiopiScore({ data }: { data: any }) {
  const stats = data?.enrollmentStats || [];
  const total = stats.length || 1;

  const scores = {
    I10: data?.attendanceRate || 0,
    I11: Math.round(stats.reduce((s: number, e: any) => s + (e.progress || 0), 0) / total),
    I12: Math.round((stats.filter((e: any) => e.quizScore !== null).length / total) * 100),
    I13: Math.round((stats.filter((e: any) => e.notesCount > 0).length / total) * 100),
    I14: 100,
    I16: stats.filter((e: any) => (e.progress || 0) < 30).length === 0 ? 100 : 0,
  };

  const globalScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-purple-700 p-6 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
      </div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-sm font-medium">Score de conformité global</p>
          <p className="text-5xl font-display font-bold mt-1">{globalScore}%</p>
          <p className="text-blue-100 text-sm mt-2">
            {globalScore >= 80 ? '✅ Prêt pour l\'audit Qualiopi' :
             globalScore >= 60 ? '⚠️ Quelques points à améliorer' :
             '❌ Actions correctives nécessaires'}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <p className="text-xs text-blue-200 font-medium">Qualiopi</p>
        </div>
      </div>

      {/* Barre de score */}
      <div className="relative z-10 mt-4">
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white dark:bg-card rounded-full transition-all duration-1000"
            style={{ width: `${globalScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-blue-200 mt-1">
          <span>0%</span>
          <span>Seuil : 80%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function QualiopiPage() {
  const [selectedCohort, setSelectedCohort] = useState<string>('');

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => formationApi.cohorts(),
  });

  const { data: dashboard, isLoading, isError, error } = useQuery({
    queryKey: ['qualiopi', selectedCohort],
    queryFn: () => formationApi.getQualiopi(selectedCohort),
    enabled: !!selectedCohort,
  });

  const atRiskCount = dashboard?.enrollmentStats?.filter((e: any) => (e.progress || 0) < 30).length || 0;
  const avgProgress = dashboard?.enrollmentStats?.length
    ? Math.round(dashboard.enrollmentStats.reduce((s: number, e: any) => s + (e.progress || 0), 0) / dashboard.enrollmentStats.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="page-title">Tableau de bord Qualiopi</h1>
            <p className="text-sm text-muted-foreground">
              Suivi pédagogique conforme — LFTG N° 03973232797 — SIRET 813 099 215 000 28
            </p>
          </div>
        </div>
        {dashboard && (
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Exporter le rapport PDF
          </button>
        )}
      </div>

      {/* Bandeau info organisme */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <strong>La Ferme Tropicale de Guyane (LFTG)</strong> — Organisme de formation certifié Qualiopi —
          PK 20,5 Route du Dégrad Saramacca, 97310 Kourou, Guyane Française —
          Contact : Elodie TRANQUARD
        </p>
      </div>

      {/* Sélecteur de cohorte */}
      <div className="lftg-card p-5">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-forest-600" />
          Sélectionner une cohorte à analyser
        </label>
        <select
          value={selectedCohort}
          onChange={(e) => setSelectedCohort(e.target.value)}
          className="w-full max-w-lg px-3 py-2.5 border border-gray-200 dark:border-border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">— Choisir une cohorte —</option>
          {(cohorts as any[]).map((c: any) => (
            <option key={c.id} value={c.id}>{c.course?.title} — {c.name}</option>
          ))}
        </select>
      </div>

      {/* État vide */}
      {!selectedCohort && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg">Sélectionnez une cohorte</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
            Choisissez une cohorte pour afficher le tableau de bord de conformité Qualiopi avec les 6 indicateurs clés.
          </p>
        </div>
      )}

      {/* Chargement */}
      {selectedCohort && isLoading && (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Calcul des indicateurs Qualiopi...</p>
        </div>
      )}

      {dashboard && (
        <>
          {/* Score global */}
          <GlobalQualiopiScore data={dashboard} />

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lftg-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-forest-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{dashboard.totalEnrollments || 0}</p>
                <p className="text-xs text-gray-500">Apprenants</p>
              </div>
            </div>
            <div className="lftg-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{avgProgress}%</p>
                <p className="text-xs text-gray-500">Progression moy.</p>
              </div>
            </div>
            <div className="lftg-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <PenLine className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{dashboard.attendanceRate || 0}%</p>
                <p className="text-xs text-gray-500">Assiduité</p>
              </div>
            </div>
            <div className={`lftg-card p-4 flex items-center gap-3 ${atRiskCount > 0 ? 'border-red-200 bg-red-50/30' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${atRiskCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <AlertTriangle className={`w-5 h-5 ${atRiskCount > 0 ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${atRiskCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>{atRiskCount}</p>
                <p className="text-xs text-gray-500">À risque</p>
              </div>
            </div>
          </div>

          {/* Indicateurs Qualiopi */}
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Indicateurs de conformité Qualiopi
              <span className="ml-2 text-xs font-normal text-gray-400">Référentiel national de certification</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {QUALIOPI_INDICATORS.map((ind) => (
                <IndicatorCard key={ind.id} indicator={ind} data={dashboard} />
              ))}
            </div>
          </div>

          {/* Suivi individuel */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-forest-600" />
                Suivi individuel des apprenants
              </h2>
              <span className="text-sm text-gray-400 font-medium">{dashboard.course?.title}</span>
            </div>

            {atRiskCount > 0 && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800">
                    {atRiskCount} apprenant{atRiskCount > 1 ? 's' : ''} à risque de décrochage
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Action requise pour la conformité Qualiopi I16 : contactez ces apprenants pour un entretien de suivi.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {dashboard.enrollmentStats?.map((stat: any) => (
                <LearnerRow key={stat.enrollmentId} stat={stat} />
              ))}
              {(!dashboard.enrollmentStats || dashboard.enrollmentStats.length === 0) && (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun apprenant inscrit à cette cohorte</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
