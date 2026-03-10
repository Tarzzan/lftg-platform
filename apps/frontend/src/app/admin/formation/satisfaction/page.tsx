'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formationApi } from '@/lib/api';
import {
  Star, ThumbsUp, ThumbsDown, Meh, Send, CheckCircle,
  BarChart3, Users, MessageSquare, TrendingUp, Award
} from 'lucide-react';

// ─── Composant étoiles ────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hover || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Formulaire de satisfaction ───────────────────────────────────────────────
function SatisfactionForm({ cohortId, enrollmentId, onSuccess }: { cohortId: string; enrollmentId: string; onSuccess: () => void }) {
  const [ratings, setRatings] = useState({
    overall: 0,
    content: 0,
    trainer: 0,
    organization: 0,
    tools: 0,
  });
  const [recommend, setRecommend] = useState<'yes' | 'maybe' | 'no' | null>(null);
  const [comment, setComment] = useState('');
  const [improvements, setImprovements] = useState('');

  const submitMutation = useMutation({
    mutationFn: () => formationApi.submitFeedback({
      cohortId,
      enrollmentId,
      overallRating: ratings.overall,
      contentRating: ratings.content,
      trainerRating: ratings.trainer,
      organizationRating: ratings.organization,
      toolsRating: ratings.tools,
      wouldRecommend: recommend === 'yes' ? true : recommend === 'no' ? false : null,
      comment,
      improvements,
    }),
    onSuccess,
  });

  const isValid = ratings.overall > 0 && ratings.content > 0 && ratings.trainer > 0;

  const ratingFields = [
    { key: 'overall' as const, label: 'Satisfaction globale', desc: 'Votre impression générale de la formation' },
    { key: 'content' as const, label: 'Qualité du contenu', desc: 'Pertinence et clarté des supports pédagogiques' },
    { key: 'trainer' as const, label: 'Qualité du formateur', desc: 'Pédagogie, disponibilité et expertise' },
    { key: 'organization' as const, label: 'Organisation', desc: 'Planning, rythme et logistique de la formation' },
    { key: 'tools' as const, label: 'Outils numériques', desc: 'Facilité d\'utilisation de la plateforme' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Questionnaire de satisfaction</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
          Votre avis est précieux pour améliorer nos formations. Ce questionnaire est anonyme et prend moins de 3 minutes.
        </p>
      </div>

      {/* Notes par critère */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Évaluations</h3>
        {ratingFields.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <div className="flex-shrink-0">
              <StarRating
                value={ratings[key]}
                onChange={(v) => setRatings(prev => ({ ...prev, [key]: v }))}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommandation */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide mb-4">
          Recommanderiez-vous cette formation ?
        </h3>
        <div className="flex items-center gap-3">
          {[
            { value: 'yes' as const, icon: ThumbsUp, label: 'Oui', color: 'text-green-600 bg-green-50 border-green-200', activeColor: 'bg-green-600 text-white border-green-600' },
            { value: 'maybe' as const, icon: Meh, label: 'Peut-être', color: 'text-amber-600 bg-amber-50 border-amber-200', activeColor: 'bg-amber-500 text-white border-amber-500' },
            { value: 'no' as const, icon: ThumbsDown, label: 'Non', color: 'text-red-600 bg-red-50 border-red-200', activeColor: 'bg-red-500 text-white border-red-500' },
          ].map(({ value, icon: Icon, label, color, activeColor }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRecommend(value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${
                recommend === value ? activeColor : color
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Commentaires */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Commentaires libres</h3>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Ce que vous avez apprécié
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Points forts de la formation..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Axes d'amélioration
          </label>
          <textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="Suggestions pour améliorer la formation..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none"
          />
        </div>
      </div>

      {/* Bouton envoi */}
      <button
        onClick={() => submitMutation.mutate()}
        disabled={!isValid || submitMutation.isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-forest-600 text-white font-semibold rounded-xl hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {submitMutation.isPending ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            Envoyer mon évaluation
          </>
        )}
      </button>
      {!isValid && (
        <p className="text-center text-xs text-gray-400">
          Veuillez noter au minimum la satisfaction globale, le contenu et le formateur
        </p>
      )}
    </div>
  );
}

// ─── Résultats agrégés (vue formateur) ───────────────────────────────────────
function FeedbackResults({ feedbacks }: { feedbacks: any[] }) {
  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-muted/20 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-gray-300" />
        </div>
        <p className="font-medium text-gray-500">Aucune évaluation reçue</p>
        <p className="text-sm text-gray-400 mt-1">Les évaluations apparaîtront ici après soumission par les apprenants</p>
      </div>
    );
  }

  const avg = (key: string) => {
    const vals = feedbacks.filter(f => f[key] > 0).map(f => f[key]);
    return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  };

  const recommend = {
    yes: feedbacks.filter(f => f.wouldRecommend === true).length,
    no: feedbacks.filter(f => f.wouldRecommend === false).length,
    maybe: feedbacks.filter(f => f.wouldRecommend === null).length,
  };

  const metrics = [
    { label: 'Satisfaction globale', key: 'overallRating', icon: Star, color: 'amber' },
    { label: 'Contenu', key: 'contentRating', icon: BarChart3, color: 'blue' },
    { label: 'Formateur', key: 'trainerRating', icon: Award, color: 'purple' },
    { label: 'Organisation', key: 'organizationRating', icon: TrendingUp, color: 'green' },
    { label: 'Outils', key: 'toolsRating', icon: Users, color: 'teal' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metrics.map(({ label, key, icon: Icon }) => (
          <div key={key} className="bg-white dark:bg-card rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{avg(key)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            <div className="flex justify-center mt-2">
              <StarRating value={Math.round(parseFloat(avg(key)) || 0)} readonly />
            </div>
          </div>
        ))}
      </div>

      {/* Recommandation */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-green-600" /> Recommandation
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full transition-all" style={{ width: `${(recommend.yes / feedbacks.length) * 100}%` }} />
            <div className="bg-amber-400 h-full transition-all" style={{ width: `${(recommend.maybe / feedbacks.length) * 100}%` }} />
            <div className="bg-red-400 h-full transition-all" style={{ width: `${(recommend.no / feedbacks.length) * 100}%` }} />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{recommend.yes} oui</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{recommend.maybe} peut-être</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{recommend.no} non</span>
          </div>
        </div>
      </div>

      {/* Commentaires */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-500" /> Commentaires ({feedbacks.filter(f => f.comment).length})
        </h3>
        {feedbacks.filter(f => f.comment).map((f, i) => (
          <div key={i} className="bg-white dark:bg-card rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <StarRating value={f.overallRating} readonly />
              <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <p className="text-sm text-gray-700">{f.comment}</p>
            {f.improvements && (
              <p className="text-sm text-amber-700 mt-2 pt-2 border-t border-gray-50">
                💡 {f.improvements}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function SatisfactionPage() {
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const { data: cohorts = [] , isError } = useQuery({
    queryKey: ['cohorts'],
    queryFn: formationApi.cohorts,
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['feedbacks', selectedCohort],
    queryFn: () => formationApi.getFeedbacks(selectedCohort),
    enabled: !!selectedCohort,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: formationApi.myEnrollments,
  });

  // Trouver l'enrollment correspondant à la cohorte sélectionnée
  const myEnrollment = enrollments.find((e: any) => e.cohortId === selectedCohort);

  if (submitted) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Merci pour votre retour !</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Votre évaluation a bien été enregistrée. Elle contribue à améliorer la qualité de nos formations.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500" />
          Satisfaction & Évaluations
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Questionnaires de satisfaction — Indicateur 30 Qualiopi</p>
      </div>

      {/* Sélecteur de cohorte */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sélectionner une cohorte</label>
        <select
          value={selectedCohort}
          onChange={(e) => setSelectedCohort(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-300"
        >
          <option value="">— Choisir une cohorte —</option>
          {cohorts.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name} — {c.course?.title}</option>
          ))}
        </select>
      </div>

      {selectedCohort && (
        <>
          {/* Si l'utilisateur est apprenant dans cette cohorte → formulaire */}
          {myEnrollment && (
            <SatisfactionForm
              cohortId={selectedCohort}
              enrollmentId={myEnrollment.id}
              onSuccess={() => setSubmitted(true)}
            />
          )}
          {/* Résultats agrégés (formateurs/admin) */}
          {!myEnrollment && (
            <FeedbackResults feedbacks={feedbacks} />
          )}
        </>
      )}
    </div>
  );
}
