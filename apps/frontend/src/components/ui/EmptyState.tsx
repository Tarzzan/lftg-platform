'use client';
import { ReactNode } from 'react';

// ─── Assets CDN Mascottes ─────────────────────────────────────────────────────
const MASCOTS = {
  peco_empty:   'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/RVzvPoLvUuowKCFW.webp',
  capi_no_data: 'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/RiSvBtFhRRUospoU.webp',
  peco_success: 'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/lGDxysHYfPaTjgGM.webp',
  capi_welcome: 'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/kMXhqAgOXzFwhyou.webp',
  peco_sleep:   'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/VPgkmFcnijPuFdRx.webp',
  capi_trophy:  'https://files.manuscdn.com/user_upload_by_module/session_file/92503813/lodkjTwEpwhgToTR.webp',
};

type MascotType = keyof typeof MASCOTS;
type Variant = 'empty' | 'error' | 'success' | 'loading' | 'no-data' | 'welcome';

interface EmptyStateProps {
  variant?: Variant;
  mascot?: MascotType;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const VARIANT_DEFAULTS: Record<Variant, { mascot: MascotType; bg: string; titleColor: string }> = {
  empty:   { mascot: 'peco_empty',   bg: 'from-forest-50 to-emerald-50',  titleColor: 'text-forest-800' },
  error:   { mascot: 'capi_no_data', bg: 'from-red-50 to-orange-50',      titleColor: 'text-red-700' },
  success: { mascot: 'peco_success', bg: 'from-emerald-50 to-teal-50',    titleColor: 'text-emerald-800' },
  loading: { mascot: 'peco_sleep',   bg: 'from-blue-50 to-indigo-50',     titleColor: 'text-blue-800' },
  'no-data':{ mascot: 'capi_no_data',bg: 'from-amber-50 to-yellow-50',    titleColor: 'text-amber-800' },
  welcome: { mascot: 'capi_welcome', bg: 'from-forest-50 to-teal-50',     titleColor: 'text-forest-800' },
};

const SIZE_MAP = {
  sm: { img: 'w-20 h-20', padding: 'p-6', title: 'text-base', desc: 'text-xs' },
  md: { img: 'w-32 h-32', padding: 'p-8', title: 'text-lg', desc: 'text-sm' },
  lg: { img: 'w-48 h-48', padding: 'p-12', title: 'text-2xl', desc: 'text-base' },
};

export function EmptyState({
  variant = 'empty',
  mascot,
  title,
  description,
  action,
  size = 'md',
}: EmptyStateProps) {
  const defaults = VARIANT_DEFAULTS[variant];
  const mascotKey = mascot ?? defaults.mascot;
  const mascotUrl = MASCOTS[mascotKey];
  const s = SIZE_MAP[size];

  return (
    <>
      <style>{`
        @keyframes mascotBounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-12px) scale(1.03); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .empty-state-mascot { animation: mascotBounce 3s ease-in-out infinite; }
        .empty-state-container { animation: fadeInUp 0.5s ease-out; }
      `}</style>
      <div className={`empty-state-container flex flex-col items-center justify-center text-center ${s.padding} rounded-3xl bg-gradient-to-br ${defaults.bg} border border-white/80 shadow-inner`}>
        {/* Cercles décoratifs */}
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-white/40 blur-xl scale-150" />
          <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl scale-200" />
          <img
            src={mascotUrl}
            alt="Mascotte LFTG"
            className={`empty-state-mascot relative z-10 ${s.img} object-contain drop-shadow-xl`}
            style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }}
          />
        </div>

        {/* Texte */}
        <h3 className={`font-bold ${s.title} ${defaults.titleColor} mb-2`}
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          {title}
        </h3>
        {description && (
          <p className={`${s.desc} text-gray-500 max-w-xs leading-relaxed mb-4`}>
            {description}
          </p>
        )}

        {/* Action */}
        {action && <div className="mt-2">{action}</div>}

        {/* Décoration feuilles */}
        <div className="flex gap-2 mt-4 opacity-30">
          {['🌿', '🍃', '🌱'].map((leaf, i) => (
            <span key={i} className="text-lg" style={{ animationDelay: `${i * 0.3}s` }}>{leaf}</span>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Skeleton Loader Tropical ─────────────────────────────────────────────────
export function TropicalSkeleton({ rows = 3, cols = 1 }: { rows?: number; cols?: number }) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .tropical-skeleton {
          background: linear-gradient(90deg, #f0fdf4 25%, #dcfce7 50%, #f0fdf4 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className={`grid gap-4 ${cols > 1 ? `grid-cols-${cols}` : ''}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-forest-100 shadow-sm">
            <div className="tropical-skeleton h-32 w-full" />
            <div className="p-4 space-y-2 bg-white">
              <div className="tropical-skeleton h-4 w-3/4 rounded-full" />
              <div className="tropical-skeleton h-3 w-1/2 rounded-full" />
              <div className="tropical-skeleton h-3 w-2/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Page Header Tropical ─────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  bgImage?: string;
  actions?: ReactNode;
}

export function TropicalPageHeader({ title, subtitle, icon, bgImage, actions }: PageHeaderProps) {
  const defaultBg = 'linear-gradient(135deg, #0d2b1a 0%, #1a4731 50%, #2d7d7d 100%)';

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-6"
      style={{
        background: bgImage ? `url(${bgImage}) center/cover no-repeat` : defaultBg,
        minHeight: '100px',
      }}
    >
      {bgImage && (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(13,43,26,0.8) 0%, rgba(26,71,49,0.7) 100%)' }} />
      )}
      <div className="relative z-10 flex items-center justify-between p-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-3xl drop-shadow-lg">{icon}</span>
          )}
          <div>
            <h1
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'Playfair Display, Georgia, serif', textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-white/70 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {/* Décoration feuilles */}
      <div className="absolute bottom-0 right-4 opacity-20 text-4xl pointer-events-none select-none">
        🌿
      </div>
    </div>
  );
}
