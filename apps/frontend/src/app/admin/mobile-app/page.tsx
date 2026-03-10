'use client';
import { useState, useEffect } from 'react';
import { dashboardApi } from '@/lib/api';

interface DashboardStats {
  animals?: { alive: number; species: number; activeBroods: number };
  stock?: { total: number; lowStock: number };
  workflows?: { total: number };
  hr?: { employees: number };
  formation?: { courses: number };
}

const SCREENS = ['home', 'animals', 'alerts', 'profile'] as const;
type Screen = typeof SCREENS[number];

export default function MobileAppPage() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    dashboardApi.stats()
      .then(setStats)
      .catch((e: any) => setError(e?.response?.data?.message || 'Erreur'))
      .finally(() => setLoading(false));
  }, []);

  const HomeScreen = () => (
    <div className="bg-gradient-to-b from-green-700 to-green-900 h-full flex flex-col">
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🦜</span>
          <span className="text-white font-bold text-lg">LFTG Mobile</span>
        </div>
        <p className="text-green-200 text-xs">Données en temps réel</p>
      </div>
      <div className="flex-1 bg-gray-50 dark:bg-muted/20 rounded-t-3xl px-4 pt-5 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-card border border-gray-100 rounded-xl p-3 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-1" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { icon: '🐾', label: 'Animaux vivants', count: stats?.animals?.alive ?? 0, color: 'bg-blue-50 border-blue-100' },
              { icon: '🥚', label: 'Couvées actives', count: stats?.animals?.activeBroods ?? 0, color: 'bg-green-50 border-green-100' },
              { icon: '⚠️', label: 'Stock faible', count: stats?.stock?.lowStock ?? 0, color: 'bg-red-50 border-red-100' },
              { icon: '🎓', label: 'Formations', count: stats?.formation?.courses ?? 0, color: 'bg-purple-50 border-purple-100' },
            ].map((item) => (
              <div key={item.label} className={`${item.color} border rounded-xl p-3 text-center`}>
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-bold text-gray-800 text-lg">{item.count}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
            <p className="text-xs font-semibold text-red-500">⚠️ ERREUR</p>
            <p className="text-sm text-gray-700">{error}</p>
          </div>
        )}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-3 mb-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">RÉSUMÉ</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Espèces</span>
              <span className="font-medium">{stats?.animals?.species ?? '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Employés</span>
              <span className="font-medium">{stats?.hr?.employees ?? '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Articles stock</span>
              <span className="font-medium">{stats?.stock?.total ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AnimalsScreen = () => (
    <div className="h-full bg-gray-50 dark:bg-muted/20 flex flex-col">
      <div className="bg-white px-4 py-3 border-b border-gray-200 dark:border-border">
        <h2 className="font-bold text-gray-900">Animaux</h2>
        <p className="text-xs text-gray-500">{stats?.animals?.alive ?? 0} animaux vivants · {stats?.animals?.species ?? 0} espèces</p>
      </div>
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-4xl mb-3">🐾</p>
          <p className="font-medium text-gray-600">Liste des animaux</p>
          <p className="text-xs mt-1">Disponible dans l&apos;interface admin</p>
        </div>
      </div>
    </div>
  );

  const AlertsScreen = () => (
    <div className="h-full bg-gray-50 dark:bg-muted/20 flex flex-col">
      <div className="bg-white px-4 py-3 border-b border-gray-200 dark:border-border">
        <h2 className="font-bold text-gray-900">Alertes</h2>
        <p className="text-xs text-gray-500">{stats?.stock?.lowStock ?? 0} alertes stock faible</p>
      </div>
      <div className="flex-1 p-4">
        {(stats?.stock?.lowStock ?? 0) > 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-red-500 mb-1">⚠️ STOCK FAIBLE</p>
            <p className="text-sm font-medium text-gray-800">{stats?.stock?.lowStock} article(s) en rupture imminente</p>
            <p className="text-xs text-gray-500">Vérifiez le module Stock</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-medium text-gray-600">Aucune alerte active</p>
          </div>
        )}
      </div>
    </div>
  );

  const ProfileScreen = () => (
    <div className="h-full bg-gray-50 dark:bg-muted/20 flex flex-col">
      <div className="bg-white px-4 py-3 border-b border-gray-200 dark:border-border">
        <h2 className="font-bold text-gray-900">Profil</h2>
      </div>
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-4xl mb-3">👤</p>
          <p className="font-medium text-gray-600">Profil utilisateur</p>
          <p className="text-xs mt-1">Gérez votre compte depuis l&apos;interface admin</p>
        </div>
      </div>
    </div>
  );

  const screens: Record<Screen, JSX.Element> = {
    home: <HomeScreen />,
    animals: <AnimalsScreen />,
    alerts: <AlertsScreen />,
    profile: <ProfileScreen />,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application Mobile LFTG</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Prévisualisation de l&apos;app mobile — données en temps réel</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-border shadow-sm animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-7 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : (
          [
            { label: 'Animaux vivants', value: stats?.animals?.alive ?? 0, color: 'text-green-600' },
            { label: 'Espèces', value: stats?.animals?.species ?? 0, color: 'text-blue-600' },
            { label: 'Couvées actives', value: stats?.animals?.activeBroods ?? 0, color: 'text-purple-600' },
            { label: 'Alertes stock', value: stats?.stock?.lowStock ?? 0, color: stats?.stock?.lowStock ? 'text-red-600' : 'text-gray-600' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-border shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Simulateur mobile */}
      <div className="flex gap-8 items-start">
        {/* Téléphone */}
        <div className="flex-shrink-0">
          <div className="w-64 bg-gray-900 rounded-3xl p-3 shadow-2xl">
            <div className="bg-black rounded-2xl overflow-hidden" style={{ height: '520px' }}>
              {/* Notch */}
              <div className="bg-black h-6 flex items-center justify-center">
                <div className="w-16 h-3 bg-gray-800 rounded-full" />
              </div>
              {/* Écran */}
              <div className="bg-white dark:bg-card" style={{ height: '460px', overflow: 'hidden' }}>
                {screens[activeScreen]}
              </div>
              {/* Barre de navigation */}
              <div className="bg-white dark:bg-card border-t border-gray-200 dark:border-border h-14 flex items-center justify-around px-4">
                {[
                  { screen: 'home' as Screen, icon: '🏠', label: 'Accueil' },
                  { screen: 'animals' as Screen, icon: '🐾', label: 'Animaux' },
                  { screen: 'alerts' as Screen, icon: '🔔', label: 'Alertes' },
                  { screen: 'profile' as Screen, icon: '👤', label: 'Profil' },
                ].map(({ screen, icon, label }) => (
                  <button
                    key={screen}
                    onClick={() => setActiveScreen(screen)}
                    className={`flex flex-col items-center gap-0.5 ${activeScreen === screen ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Infos techniques */}
        <div className="flex-1 space-y-4">
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5">
            <h3 className="font-semibold text-gray-900 dark:text-foreground mb-3">Stack technique</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Framework', value: 'Expo + React Native' },
                { label: 'Langage', value: 'TypeScript' },
                { label: 'UI', value: 'TailwindCSS (NativeWind)' },
                { label: 'Base de données', value: 'Drizzle ORM + MySQL/TiDB' },
                { label: 'Auth', value: 'Manus-Oauth (JWT)' },
                { label: 'API', value: 'LFTG Platform API v15.0.0' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5">
            <h3 className="font-semibold text-gray-900 dark:text-foreground mb-3">Fonctionnalités prévues</h3>
            <div className="space-y-2">
              {[
                '✅ Consultation des animaux en temps réel',
                '✅ Alertes push (stock faible, santé animaux)',
                '✅ Suivi des couvées',
                '🔄 Scan QR code pour identification animaux',
                '🔄 Saisie des soins depuis le terrain',
                '🔄 Mode hors-ligne avec synchronisation',
              ].map((f) => (
                <p key={f} className="text-sm text-gray-700">{f}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
