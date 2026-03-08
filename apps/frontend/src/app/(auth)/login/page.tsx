'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.user, res.accessToken ?? res.access_token);
      // Cookie de session pour le middleware Next.js
      document.cookie = `lftg_session=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      router.push('/admin');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-jungle-gradient jungle-overlay flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 border border-white/20">
            <span className="text-4xl">🦜</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white">LFTG Platform</h1>
          <p className="text-forest-200 mt-1 text-sm">La Ferme Tropicale de Guyane</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lftg-lg p-8">
          <h2 className="text-xl font-display font-semibold text-foreground mb-6">Connexion</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">Adresse email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@lftg.fr"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-700 mb-1">Mot de passe</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-forest-600 hover:bg-forest-700 disabled:opacity-60 text-white font-medium text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-forest-300 text-xs mt-6">
          © {new Date().getFullYear()} La Ferme Tropicale de Guyane
        </p>
      </div>
    </div>
  );
}
