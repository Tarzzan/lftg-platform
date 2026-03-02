'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Award, Users, TrendingUp, CheckCircle, Clock, FileSignature,
  BookOpen, AlertTriangle, Download, ChevronDown, ChevronRight,
  Star, Target, BarChart3, Shield
} from 'lucide-react';
import { formationApi } from '@/lib/api';

const QUALIOPI_INDICATORS = [
  { id: 'I10', label: 'Indicateur 10', title: 'Suivi de l\'assiduité', description: 'Feuilles d\'émargement numériques signées par les apprenants et les formateurs', icon: FileSignature, color: 'blue' },
  { id: 'I11', label: 'Indicateur 11', title: 'Suivi de la progression', description: 'Progression individuelle par leçon, temps passé et résultats aux évaluations', icon: TrendingUp, color: 'green' },
  { id: 'I12', label: 'Indicateur 12', title: 'Engagement des apprenants', description: 'Taux de complétion, quiz, interactions avec les supports pédagogiques', icon: Target, color: 'purple' },
  { id: 'I13', label: 'Indicateur 13', title: 'Accompagnement pédagogique', description: 'Notes de suivi individualisées par le formateur, alertes décrochage', icon: Star, color: 'amber' },
  { id: 'I14', label: 'Indicateur 14', title: 'Ressources pédagogiques', description: 'Diversité des supports : PDF, vidéo, présentations, contenus interactifs', icon: BookOpen, color: 'teal' },
  { id: 'I16', label: 'Indicateur 16', title: 'Gestion des abandons', description: 'Identification des apprenants à risque (progression < 30%, absences)', icon: AlertTriangle, color: 'red' },
];

function ProgressBar({ value, color = 'forest' }: { value: number; color?: string }) {
  const colors: Record<string, string> = {
    forest: 'bg-forest-500', green: 'bg-green-500', blue: 'bg-blue-500',
    amber: 'bg-amber-500', red: 'bg-red-500', purple: 'bg-purple-500',
  };
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-700 ${colors[color] || colors.forest}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function IndicatorCard({ indicator, data }: { indicator: typeof QUALIOPI_INDICATORS[0]; data: any }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  const getScore = () => {
    if (!data) return null;
    switch (indicator.id) {
      case 'I10': return data.attendanceRate;
      case 'I11': {
        const avg = data.enrollmentStats?.reduce((s: number, e: any) => s + e.progress, 0) / (data.enrollmentStats?.length || 1);
        return Math.round(avg || 0);
      }
      case 'I12': {
        const withQuiz = data.enrollmentStats?.filter((e: any) => e.quizScore !== null).length;
        return Math.round((withQuiz / (data.enrollmentStats?.length || 1)) * 100);
      }
      case 'I13': {
        const withNotes = data.enrollmentStats?.filter((e: any) => e.notesCount > 0).length;
        return Math.round((withNotes / (data.enrollmentStats?.length || 1)) * 100);
      }
      case 'I14': return 100; // Présence de supports multi-format
      case 'I16': {
        const atRisk = data.enrollmentStats?.filter((e: any) => e.progress < 30).length;
        return atRisk;
      }
      default: return null;
    }
  };

  const score = getScore();
  const isRisk = indicator.id === 'I16';

  return (
    <div className={`lftg-card p-4 border ${colorMap[indicator.color]}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[indicator.color]}`}>
          <indicator.icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">{indicator.label}</span>
              <h3 className="font-semibold text-gray-800 text-sm mt-0.5">{indicator.title}</h3>
            </div>
            {score !== null && (
              <div className={`text-2xl font-bold ${isRisk && score > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                {isRisk ? score : `${score}%`}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{indicator.description}</p>
          {score !== null && !isRisk && (
            <div className="mt-2">
              <ProgressBar value={score} color={indicator.color} />
            </div>
          )}
          {isRisk && score !== null && score > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {score} apprenant{score > 1 ? 's' : ''} à risque de décrochage
            </div>
          )}
          {isRisk && score === 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Aucun apprenant à risque
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LearnerRow({ stat }: { stat: any }) {
  const [expanded, setExpanded] = useState(false);
  const isAtRisk = stat.progress < 30;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${isAtRisk ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-white'}`}>
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-forest-400 to-forest-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {stat.user?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-800 text-sm">{stat.user?.name || 'Apprenant inconnu'}</p>
            {isAtRisk && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">⚠ À risque</span>}
          </div>
          <p className="text-xs text-gray-400">{stat.user?.email}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{stat.progress}%</p>
            <p className="text-xs text-gray-400">Progression</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{stat.signaturesCount}</p>
            <p className="text-xs text-gray-400">Émargements</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{stat.quizScore !== null ? `${stat.quizScore}%` : '—'}</p>
            <p className="text-xs text-gray-400">Quiz</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{stat.notesCount}</p>
            <p className="text-xs text-gray-400">Notes</p>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Progression des leçons</span>
              <span className="text-xs font-medium text-gray-700">{stat.completedLessons}/{stat.totalLessons} leçons</span>
            </div>
            <ProgressBar value={stat.progress} color={isAtRisk ? 'red' : 'forest'} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function QualioPiPage() {
  const [selectedCohort, setSelectedCohort] = useState<string>('');

  const { data: cohorts = [] } = useQuery({ queryKey: ['cohorts'], queryFn: () => formationApi.cohorts() });
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['qualiopi', selectedCohort],
    queryFn: () => formationApi.getQualiopi(selectedCohort),
    enabled: !!selectedCohort,
  });

  const atRiskCount = dashboard?.enrollmentStats?.filter((e: any) => e.progress < 30).length || 0;
  const avgProgress = dashboard?.enrollmentStats?.length
    ? Math.round(dashboard.enrollmentStats.reduce((s: number, e: any) => s + e.progress, 0) / dashboard.enrollmentStats.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Tableau de bord Qualiopi</h1>
            <p className="text-sm text-muted-foreground">Suivi pédagogique conforme aux 7 critères Qualiopi — LFTG N° 03973232797</p>
          </div>
        </div>
        {dashboard && (
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Exporter le rapport
          </button>
        )}
      </div>

      {/* Sélecteur de cohorte */}
      <div className="lftg-card p-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Sélectionner une cohorte</label>
        <select
          value={selectedCohort}
          onChange={(e) => setSelectedCohort(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">— Choisir une cohorte —</option>
          {(cohorts as any[]).map((c: any) => (
            <option key={c.id} value={c.id}>{c.course?.title} — {c.name}</option>
          ))}
        </select>
      </div>

      {!selectedCohort && (
        <div className="text-center py-16 text-gray-400">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sélectionnez une cohorte pour afficher le tableau de bord Qualiopi</p>
        </div>
      )}

      {selectedCohort && isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {dashboard && (
        <>
          {/* KPIs globaux */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lftg-card p-4 text-center">
              <Users className="w-6 h-6 text-forest-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{dashboard.totalEnrollments}</p>
              <p className="text-xs text-gray-500">Apprenants inscrits</p>
            </div>
            <div className="lftg-card p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{avgProgress}%</p>
              <p className="text-xs text-gray-500">Progression moyenne</p>
            </div>
            <div className="lftg-card p-4 text-center">
              <FileSignature className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{dashboard.attendanceRate}%</p>
              <p className="text-xs text-gray-500">Taux d'assiduité</p>
            </div>
            <div className={`lftg-card p-4 text-center ${atRiskCount > 0 ? 'border-red-200 bg-red-50/30' : ''}`}>
              <AlertTriangle className={`w-6 h-6 mx-auto mb-2 ${atRiskCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              <p className={`text-2xl font-bold ${atRiskCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>{atRiskCount}</p>
              <p className="text-xs text-gray-500">Apprenants à risque</p>
            </div>
          </div>

          {/* Indicateurs Qualiopi */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Indicateurs de conformité Qualiopi
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {QUALIOPI_INDICATORS.map((ind) => (
                <IndicatorCard key={ind.id} indicator={ind} data={dashboard} />
              ))}
            </div>
          </div>

          {/* Suivi individuel */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-forest-600" />
              Suivi individuel des apprenants
              <span className="ml-auto text-sm font-normal text-gray-400">{dashboard.course?.title}</span>
            </h2>
            <div className="space-y-3">
              {dashboard.enrollmentStats?.map((stat: any) => (
                <LearnerRow key={stat.enrollmentId} stat={stat} />
              ))}
              {(!dashboard.enrollmentStats || dashboard.enrollmentStats.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Aucun apprenant inscrit à cette cohorte</p>
                </div>
              )}
            </div>
          </div>

          {/* Informations Qualiopi */}
          <div className="lftg-card p-4 bg-blue-50 border-blue-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Organisme de formation certifié Qualiopi</p>
                <p className="text-xs text-blue-600 mt-1">
                  <strong>La Ferme Tropicale de Guyane (LFTG)</strong> — SIRET 813 099 215 000 28 — N° déclaration 03973232797<br />
                  PK 20,5 Route du Dégrad Saramacca, 97310 Kourou, Guyane Française
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
