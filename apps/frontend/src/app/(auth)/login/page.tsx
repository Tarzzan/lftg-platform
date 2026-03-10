'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Eye, EyeOff, Leaf, Lock, Mail, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Particules flottantes (feuilles, lucioles)
const PARTICLES = [
  { emoji: '🍃', x: 8, y: 15, delay: 0, duration: 6 },
  { emoji: '✨', x: 85, y: 25, delay: 1.2, duration: 5 },
  { emoji: '🦋', x: 15, y: 70, delay: 2.5, duration: 7 },
  { emoji: '🍃', x: 90, y: 60, delay: 0.8, duration: 8 },
  { emoji: '✨', x: 50, y: 10, delay: 3, duration: 6 },
  { emoji: '🌿', x: 75, y: 80, delay: 1.5, duration: 9 },
  { emoji: '✨', x: 25, y: 90, delay: 4, duration: 5 },
  { emoji: '🍃', x: 60, y: 45, delay: 2, duration: 7 },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.user, res.accessToken ?? res.access_token);
      document.cookie = `lftg_session=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      router.push('/admin');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/sidebar-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay dégradé sombre */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(3,12,6,0.88) 0%, rgba(8,30,15,0.80) 50%, rgba(3,12,6,0.92) 100%)',
        }}
      />

      {/* Particules flottantes */}
      {mounted && PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none text-lg"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            opacity: 0.5,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-md">

        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(193,127,58,0.25), rgba(232,168,78,0.15))',
              border: '1px solid rgba(193,127,58,0.4)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(193,127,58,0.15)',
            }}
          >
            <span className="text-4xl" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>🦜</span>
          </div>
          <h1
            className="text-3xl font-bold text-white mb-1"
            style={{
              fontFamily: 'Georgia, serif',
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
              letterSpacing: '0.02em',
            }}
          >
            LFTG Platform
          </h1>
          <p className="text-sm" style={{ color: 'rgba(180,220,180,0.8)' }}>
            La Ferme Tropicale de Guyane
          </p>
          {/* Ligne décorative */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(193,127,58,0.5))' }} />
            <Leaf className="w-3 h-3" style={{ color: 'rgba(193,127,58,0.7)' }} />
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(193,127,58,0.5), transparent)' }} />
          </div>
        </div>

        {/* Card glassmorphism */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <h2
            className="text-lg font-semibold text-white mb-6"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
          >
            Connexion
          </h2>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{
                background: 'rgba(220,38,38,0.15)',
                border: '1px solid rgba(220,38,38,0.3)',
                color: '#fca5a5',
              }}
            >
              <span className="text-base">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(180,220,180,0.7)' }}
              >
                Adresse email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'rgba(193,127,58,0.7)' }}
                />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@lftg.fr"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    caretColor: '#c17f3a',
                  }}
                  onFocus={e => {
                    e.target.style.border = '1px solid rgba(193,127,58,0.6)';
                    e.target.style.background = 'rgba(255,255,255,0.09)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(193,127,58,0.12)';
                  }}
                  onBlur={e => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.12)';
                    e.target.style.background = 'rgba(255,255,255,0.06)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs" style={{ color: '#fca5a5' }}>{errors.email.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(180,220,180,0.7)' }}
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'rgba(193,127,58,0.7)' }}
                />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    caretColor: '#c17f3a',
                  }}
                  onFocus={e => {
                    e.target.style.border = '1px solid rgba(193,127,58,0.6)';
                    e.target.style.background = 'rgba(255,255,255,0.09)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(193,127,58,0.12)';
                  }}
                  onBlur={e => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.12)';
                    e.target.style.background = 'rgba(255,255,255,0.06)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(193,127,58,0.8)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs" style={{ color: '#fca5a5' }}>{errors.password.message}</p>
              )}
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 mt-2"
              style={{
                background: loading
                  ? 'rgba(193,127,58,0.5)'
                  : 'linear-gradient(135deg, #c17f3a, #e8a84e)',
                color: '#fff',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(193,127,58,0.4)',
                transform: loading ? 'none' : undefined,
              }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(193,127,58,0.55)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? 'none' : '0 4px 20px rgba(193,127,58,0.4)';
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion en cours…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(180,220,180,0.4)' }}>
          © {new Date().getFullYear()} La Ferme Tropicale de Guyane
        </p>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(2deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
}
