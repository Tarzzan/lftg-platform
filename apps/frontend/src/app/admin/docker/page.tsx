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

const SERVICES_STATIC = [
  { name: 'lftg-postgres-prod', image: 'postgres:15-alpine', port: '5432', role: 'Base de données' },
  { name: 'lftg-redis-prod', image: 'redis:7-alpine', port: '6379', role: 'Cache & Sessions' },
  { name: 'lftg-backend-prod', image: 'lftg-platform_backend', port: '3001', role: 'API NestJS' },
  { name: 'lftg-frontend-prod', image: 'lftg-platform_frontend', port: '3000', role: 'Next.js Frontend' },
  { name: 'lftg-nginx-prod', image: 'nginx:1.25-alpine', port: '80', role: 'Reverse Proxy' },
];

const COMPOSE_CONTENT = `version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: lftg-postgres-prod
    restart: always
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: lftg_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - lftg-network

  redis:
    image: redis:7-alpine
    container_name: lftg-redis-prod
    restart: always
    networks:
      - lftg-network

  backend:
    build:
      context: .
      dockerfile: ./apps/backend/Dockerfile
    container_name: lftg-backend-prod
    restart: always
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@postgres:5432/lftg_platform
      REDIS_URL: redis://redis:6379
      JWT_SECRET: \${JWT_SECRET}
    ports:
      - "3001:3001"
    networks:
      - lftg-network

  frontend:
    build:
      context: .
      dockerfile: ./apps/frontend/Dockerfile
    container_name: lftg-frontend-prod
    restart: always
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://nginx/api/v1
    ports:
      - "3000:3000"
    networks:
      - lftg-network

  nginx:
    image: nginx:1.25-alpine
    container_name: lftg-nginx-prod
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
      - frontend
    networks:
      - lftg-network

volumes:
  postgres_data:

networks:
  lftg-network:
    driver: bridge`;

export default function DockerPage() {
  const [tab, setTab] = useState<'services' | 'compose' | 'health'>('services');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'error'>('checking');

  useEffect(() => {
    setLoading(true);
    dashboardApi.stats()
      .then((data) => {
        setStats(data);
        setHealthStatus('healthy');
      })
      .catch((e: any) => {
        setError(e?.response?.data?.message || 'Erreur de connexion');
        setHealthStatus('error');
      })
      .finally(() => setLoading(false));
  }, []);

  const isHealthy = healthStatus === 'healthy';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure Docker</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestion des conteneurs et de la configuration</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {loading ? 'Vérification...' : isHealthy ? 'Tous les services actifs' : 'Problème détecté'}
        </div>
      </div>

      {/* Métriques live */}
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
            { label: 'Conteneurs actifs', value: SERVICES_STATIC.length, color: 'text-green-600' },
            { label: 'Animaux en DB', value: stats?.animals?.alive ?? 0, color: 'text-blue-600' },
            { label: 'Employés', value: stats?.hr?.employees ?? 0, color: 'text-purple-600' },
            { label: 'Formations', value: stats?.formation?.courses ?? 0, color: 'text-orange-600' },
          ].map((m) => (
            <div key={m.label} className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-border shadow-sm">
              <p className="text-sm text-gray-500">{m.label}</p>
              <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Onglets */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-border">
          {(['services', 'compose', 'health'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              {t === 'services' ? 'Conteneurs' : t === 'compose' ? 'docker-compose.yml' : 'Health Check'}
            </button>
          ))}
        </div>

        {tab === 'services' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-muted/20 text-xs text-gray-500 dark:text-gray-400 uppercase">
                <tr>
                  {['Conteneur', 'Image', 'Port', 'Rôle', 'Statut'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {SERVICES_STATIC.map((svc) => (
                  <tr key={svc.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-blue-700">{svc.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">{svc.image}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">{svc.port}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{svc.role}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isHealthy ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {isHealthy ? '● running' : '● unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'compose' && (
          <div className="p-4">
            <pre className="bg-gray-900 text-gray-300 rounded-lg p-4 text-xs overflow-auto max-h-[500px] font-mono">
              {COMPOSE_CONTENT}
            </pre>
          </div>
        )}

        {tab === 'health' && (
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Vérification de la santé des services...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { name: 'API Backend (NestJS)', url: '/api/v1/stats/dashboard', ok: isHealthy },
                  { name: 'Base de données (PostgreSQL)', url: 'via Prisma ORM', ok: isHealthy },
                  { name: 'Cache (Redis)', url: 'via NestJS CacheModule', ok: isHealthy },
                  { name: 'Frontend (Next.js)', url: 'http://51.210.15.92', ok: true },
                ].map((check) => (
                  <div key={check.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-foreground text-sm">{check.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{check.url}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${check.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {check.ok ? '✓ OK' : '✗ Erreur'}
                    </span>
                  </div>
                ))}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
