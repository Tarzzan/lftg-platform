'use client';
import { useState, useEffect } from 'react';

// ─── CDN URLs des mascottes IA ────────────────────────────────────────────────
const MASCOTS = {
  peco_empty:   'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/NqwgnFeyMAuAmvlu.webp',
  capi_no_data: 'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/DeJTjpXdPvPeVXUx.webp',
  peco_success: 'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/KboJwbmOGOPmmcgS.webp',
  capi_welcome: 'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/CQYNgMGdtFUmmTQU.webp',
  peco_sleeping:'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/ZARwRoPYlBwsoHfT.webp',
  capi_trophy:  'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/UvjzEjhfPJVjdwHP.webp',
};

type MascotKey = keyof typeof MASCOTS;

interface EmptyStateProps {
  title?: string;
  message?: string;
  mascot?: MascotKey;
  action?: { label: string; onClick: () => void };
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  title = 'Aucune donnée',
  message = 'Rien à afficher pour le moment.',
  mascot = 'capi_no_data',
  action,
  size = 'md',
}: EmptyStateProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const sizeMap = { sm: 'min-h-[160px]', md: 'min-h-[280px]', lg: 'min-h-[400px]' };
  const imgSize = { sm: 'w-20 h-20', md: 'w-36 h-36', lg: 'w-48 h-48' };

  return (
    <div
      className={`flex items-center justify-center ${sizeMap[size]} p-8 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="text-center max-w-sm">
        {/* Mascotte animée */}
        <div
          className={`${imgSize[size]} mx-auto mb-4 relative`}
          style={{ animation: 'mascotFloat 3s ease-in-out infinite' }}
        >
          <img
            src={MASCOTS[mascot]}
            alt="mascotte"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Texte */}
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{message}</p>

        {/* Action */}
        {action && (
          <button
            onClick={action.onClick}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1a4731, #2d7d7d)' }}
          >
            {action.label}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Erreur de chargement',
  message = 'Impossible de charger les données. Vérifiez votre connexion et réessayez.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[280px] p-8">
      <div className="text-center max-w-sm">
        <div
          className="w-36 h-36 mx-auto mb-4"
          style={{ animation: 'mascotFloat 3s ease-in-out infinite' }}
        >
          <img
            src={MASCOTS.peco_sleeping}
            alt="Péco dort"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #c17f3a, #1a4731)' }}
          >
            Réessayer
          </button>
        )}
      </div>
      <style jsx>{`
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Skeleton amélioré avec shimmer tropical ──────────────────────────────────
interface SkeletonProps { className?: string; }
function cn(...classes: (string | undefined)[]) { return classes.filter(Boolean).join(' '); }

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('rounded-md overflow-hidden relative', className)}
      style={{ background: 'linear-gradient(90deg, #e8f5e9 25%, #c8e6c9 50%, #e8f5e9 75%)', backgroundSize: '200% 100%', animation: 'shimmerTropical 1.5s infinite' }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-forest-100 p-6 space-y-3 bg-white dark:bg-gray-800">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonAnimalCard() {
  return (
    <div className="rounded-2xl border border-forest-100 overflow-hidden bg-white dark:bg-gray-800">
      <Skeleton className="h-32 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-2 border-b border-forest-100">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-4 w-1/4" />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-2">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="rounded-2xl border border-forest-100 p-6 bg-white dark:bg-gray-800">
        <SkeletonTable rows={6} />
      </div>
    </div>
  );
}

// ─── Composant de succès avec Péco qui célèbre ────────────────────────────────
export function SuccessState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[200px] p-8">
      <div className="text-center max-w-sm">
        <div
          className="w-32 h-32 mx-auto mb-4"
          style={{ animation: 'successBounce 0.6s ease-out' }}
        >
          <img src={MASCOTS.peco_success} alt="Succès" className="w-full h-full object-contain drop-shadow-lg" />
        </div>
        <h3 className="text-lg font-bold text-forest-700 dark:text-forest-400 mb-1">{title}</h3>
        {message && <p className="text-sm text-gray-500">{message}</p>}
      </div>
      <style jsx>{`
        @keyframes successBounce {
          0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.1) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
