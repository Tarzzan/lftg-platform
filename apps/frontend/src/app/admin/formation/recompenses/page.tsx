'use client';
import { useQuery } from '@tanstack/react-query';
import {
  Award, Star, Trophy, Medal, Zap, BookOpen, CheckCircle,
  Clock, TrendingUp, Download, Crown, Target, Flame,
  GraduationCap, Leaf, Shield, Heart, Loader2
} from 'lucide-react';
import { formationApi } from '@/lib/api';

// ─── Assets CDN ───────────────────────────────────────────────────────────────
const CAPI_TROPHY = 'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/lodkjTwEpwhgToTR.webp';
const CAPI_NO_DATA = 'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/RiSvBtFhRRUospoU.webp';

// ─── Configuration des badges ─────────────────────────────────────────────────
const BADGE_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string; label: string; desc: string }> = {
  FIRST_LESSON:    { icon: BookOpen,      color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200',   label: 'Premier Pas',       desc: 'Première leçon complétée' },
  FIRST_COURSE:    { icon: GraduationCap, color: 'text-forest-600', bg: 'bg-forest-50',  border: 'border-forest-200', label: 'Diplômé',           desc: 'Premier cours terminé' },
  STREAK_7:        { icon: Flame,         color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-200', label: '7 Jours de Suite',  desc: 'Connecté 7 jours consécutifs' },
  STREAK_30:       { icon: Crown,         color: 'text-gold-600',   bg: 'bg-gold-50',    border: 'border-gold-200',   label: 'Mois Complet',      desc: 'Connecté 30 jours consécutifs' },
  PERFECT_QUIZ:    { icon: Target,        color: 'text-purple-600', bg: 'bg-purple-50',  border: 'border-purple-200', label: 'Sans Faute',        desc: 'Quiz réussi à 100%' },
  SPEED_LEARNER:   { icon: Zap,           color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-200', label: 'Apprenant Rapide',  desc: 'Cours terminé en moins de 2h' },
  BIODIVERSITY:    { icon: Leaf,          color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-200',label: 'Biodiversité',      desc: 'Module faune tropicale terminé' },
  WELFARE:         { icon: Heart,         color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200',    label: 'Bien-être Animal',  desc: 'Module bien-être terminé' },
  SAFETY:          { icon: Shield,        color: 'text-gray-600',   bg: 'bg-gray-50',    border: 'border-gray-200 dark:border-border',   label: 'Sécurité',          desc: 'Module sécurité terminé' },
  TOP_LEARNER:     { icon: Trophy,        color: 'text-gold-600',   bg: 'bg-gold-50',    border: 'border-gold-200',   label: 'Top Apprenant',     desc: 'Classé dans le top 3' },
};

// ─── Composant Badge ──────────────────────────────────────────────────────────
function BadgeCard({ badge, unlocked }: { badge: any; unlocked: boolean }) {
  const conf = BADGE_CONFIG[badge.type] || BADGE_CONFIG.FIRST_LESSON;
  const Icon = conf.icon;

  return (
    <div className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
      unlocked
        ? `${conf.bg} ${conf.border} shadow-sm hover:shadow-md`
        : 'bg-gray-50 dark:bg-muted/20 border-gray-100 opacity-50 grayscale'
    }`}>
      {unlocked && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-forest-500 rounded-full flex items-center justify-center shadow-sm">
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${unlocked ? conf.bg : 'bg-gray-100'}`}>
        <Icon className={`w-7 h-7 ${unlocked ? conf.color : 'text-gray-300'}`} />
      </div>
      <p className={`text-xs font-bold text-center ${unlocked ? 'text-gray-800' : 'text-gray-400'}`}>{conf.label}</p>
      <p className={`text-xs text-center mt-0.5 ${unlocked ? 'text-gray-500' : 'text-gray-300'}`}>{conf.desc}</p>
      {unlocked && badge.earnedAt && (
        <p className="text-xs text-gray-400 mt-2">
          {new Date(badge.earnedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </p>
      )}
    </div>
  );
}

// ─── Composant Certificat ─────────────────────────────────────────────────────
function CertificateCard({ cert }: { cert: any }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gold-50 via-amber-50 to-yellow-50 border-2 border-gold-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
      {/* Décoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gold-100/50 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-100/50 rounded-full translate-y-6 -translate-x-6" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-gold-600" />
          </div>
          <button className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-card border border-gold-200 rounded-xl text-xs font-medium text-gold-700 hover:bg-gold-50 transition-all">
            <Download className="w-3.5 h-3.5" /> Télécharger
          </button>
        </div>

        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{cert.course?.title || 'Formation LFTG'}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Délivré le {new Date(cert.issuedAt || cert.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-gold-200 rounded-full overflow-hidden">
            <div className="h-full bg-gold-500 rounded-full" style={{ width: '100%' }} />
          </div>
          <span className="text-xs font-bold text-gold-700">100%</span>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-forest-100 flex items-center justify-center">
            <CheckCircle className="w-2.5 h-2.5 text-forest-600" />
          </div>
          <p className="text-xs text-gray-500">Certifié par La Ferme Tropicale de Guyane</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function RecompensesPage() {
  const { data: certificates = [], isLoading: loadingCerts, isError }
  = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => formationApi.getMyCertificates(),
  });

  const { data: badges = [], isLoading: loadingBadges } = useQuery({
    queryKey: ['my-badges'],
    queryFn: () => formationApi.getMyBadges(),
  });

  const { data: leaderboard = [], isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => formationApi.getLeaderboard(),
  });

  const isLoading = loadingCerts || loadingBadges || loadingLeaderboard;

  // Tous les types de badges possibles
  const allBadgeTypes = Object.keys(BADGE_CONFIG);
  const earnedTypes = new Set(badges.map((b: any) => b.type));
  const totalPoints = badges.length * 50 + certificates.length * 200;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      <p className="text-sm text-gray-500">Chargement de vos récompenses...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gold-500 via-amber-500 to-orange-400 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
        </div>
        <div className="relative flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-white/90" />
              <span className="text-sm font-medium text-white/80">Mes Récompenses</span>
            </div>
            <h1 className="text-3xl font-display font-bold mb-1">
              {totalPoints.toLocaleString()} points
            </h1>
            <p className="text-white/80 text-sm">
              {badges.length} badge{badges.length !== 1 ? 's' : ''} · {certificates.length} certificat{certificates.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-shrink-0 text-center">
            <img
              src={CAPI_TROPHY}
              alt="Capi avec trophée"
              className="w-24 h-24 object-contain drop-shadow-xl"
              style={{ animation: 'mascotFloat 3s ease-in-out infinite', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}
            />
            <p className="text-xs text-white/70 mt-1">Niveau Expert</p>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="relative mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Medal,  label: 'Badges',       value: `${badges.length}/${allBadgeTypes.length}` },
            { icon: Award,  label: 'Certificats',  value: certificates.length },
            { icon: Star,   label: 'Points',       value: totalPoints },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
              <Icon className="w-4 h-4 text-white/80 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-xs text-white/70">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Certificats ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-gold-500" />
            Mes Certificats
          </h2>
          <span className="text-sm text-gray-400">{certificates.length} obtenu{certificates.length !== 1 ? 's' : ''}</span>
        </div>
        {certificates.length === 0 ? (
          <div className="flex flex-col items-center py-10 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
            <img src={CAPI_NO_DATA} alt="Capi" className="w-24 h-24 object-contain mb-3" style={{ animation: 'mascotFloat 3s ease-in-out infinite' }} />
            <p className="text-sm font-semibold text-amber-700">Aucun certificat pour le moment</p>
            <p className="text-xs text-amber-500 mt-1">Terminez une formation pour obtenir votre premier certificat</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert: any) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
        )}
      </section>

      {/* ── Badges ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <Medal className="w-5 h-5 text-maroni-500" />
            Collection de Badges
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-maroni-400 to-forest-500 rounded-full transition-all duration-700"
                style={{ width: `${(badges.length / allBadgeTypes.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{badges.length}/{allBadgeTypes.length}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {allBadgeTypes.map((type) => {
            const earned = badges.find((b: any) => b.type === type);
            return (
              <BadgeCard
                key={type}
                badge={{ type, earnedAt: earned?.earnedAt || earned?.createdAt }}
                unlocked={!!earned}
              />
            );
          })}
        </div>
      </section>

      {/* ── Classement ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Classement de la Promotion
          </h2>
        </div>
        <div className="bg-white dark:bg-card border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Classement disponible dès que plusieurs apprenants sont inscrits</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {leaderboard.slice(0, 10).map((entry: any, idx: number) => (
                <div key={entry.userId} className={`flex items-center gap-4 px-5 py-3 transition-colors hover:bg-gray-50 dark:bg-muted/20 ${
                  idx === 0 ? 'bg-gold-50/50' : idx === 1 ? 'bg-gray-50/50' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                    idx === 0 ? 'bg-gold-400 text-white' :
                    idx === 1 ? 'bg-gray-300 text-white' :
                    idx === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {idx === 0 ? <Crown className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {entry.user?.firstName} {entry.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{entry.completedLessons} leçons · {entry.badges} badges</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-700">{entry.points} pts</p>
                    <div className="flex items-center gap-0.5 justify-end mt-0.5">
                      {Array.from({ length: Math.min(entry.badges, 5) }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 text-gold-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
