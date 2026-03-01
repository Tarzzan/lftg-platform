'use client';
import { useState } from 'react';

const services = [
  { name: 'lftg-postgres-prod', image: 'postgres:15-alpine', status: 'running', port: '5433:5432', cpu: '2.1%', memory: '128 MB', uptime: '3j 14h 22m' },
  { name: 'lftg-redis-prod', image: 'redis:7-alpine', status: 'running', port: '6380:6379', cpu: '0.3%', memory: '12 MB', uptime: '3j 14h 22m' },
  { name: 'lftg-backend-prod', image: 'lftg-platform_backend', status: 'running', port: '3001:3000', cpu: '5.7%', memory: '256 MB', uptime: '3j 14h 20m' },
  { name: 'lftg-frontend-prod', image: 'lftg-platform_frontend', status: 'running', port: '3000:3000', cpu: '1.2%', memory: '192 MB', uptime: '3j 14h 19m' },
  { name: 'lftg-nginx-prod', image: 'nginx:1.25-alpine', status: 'running', port: '80:80, 443:443', cpu: '0.1%', memory: '8 MB', uptime: '3j 14h 19m' },
];

const statusColor: Record<string, string> = {
  running: 'bg-green-100 text-green-800',
  stopped: 'bg-red-100 text-red-800',
  restarting: 'bg-yellow-100 text-yellow-800',
};

export default function DockerPage() {
  const [tab, setTab] = useState<'services' | 'compose' | 'logs'>('services');

  const composeContent = `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: lftg-postgres-prod
    restart: always
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: \${POSTGRES_DB:-lftg-prod}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
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
      - DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@postgres:5432/\${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=\${JWT_SECRET}
      - NODE_ENV=production
    networks:
      - lftg-network

  frontend:
    build:
      context: .
      dockerfile: ./apps/frontend/Dockerfile
    container_name: lftg-frontend-prod
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000
      - NODE_ENV=production
    networks:
      - lftg-network

  nginx:
    image: nginx:1.25-alpine
    container_name: lftg-nginx-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
      - backend
    networks:
      - lftg-network

volumes:
  postgres_data_prod:

networks:
  lftg-network:
    driver: bridge`;

  const logs = [
    { time: '2026-03-01 12:00:01', service: 'backend', level: 'info', message: '🦜 LFTG Platform API v13.0.0 démarrée sur http://localhost:3001' },
    { time: '2026-03-01 12:00:00', service: 'frontend', level: 'info', message: '✓ Ready in 2.4s — http://localhost:3000' },
    { time: '2026-03-01 11:59:58', service: 'postgres', level: 'info', message: 'database system is ready to accept connections' },
    { time: '2026-03-01 11:59:57', service: 'redis', level: 'info', message: 'Ready to accept connections tcp' },
    { time: '2026-03-01 11:59:56', service: 'nginx', level: 'info', message: 'nginx/1.25.3 started' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure Docker</h1>
          <p className="text-gray-500 mt-1">Gestion des conteneurs Docker en production</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
            ▶ Démarrer tous
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
            ■ Arrêter tous
          </button>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Conteneurs actifs', value: '5/5', color: 'text-green-600' },
          { label: 'CPU total', value: '9.4%', color: 'text-blue-600' },
          { label: 'Mémoire totale', value: '596 MB', color: 'text-purple-600' },
          { label: 'Uptime moyen', value: '3j 14h', color: 'text-orange-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['services', 'compose', 'logs'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'services' ? 'Services' : t === 'compose' ? 'docker-compose.prod.yml' : 'Logs en direct'}
            </button>
          ))}
        </div>

        {tab === 'services' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Conteneur', 'Image', 'Statut', 'Ports', 'CPU', 'Mémoire', 'Uptime', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((s) => (
                  <tr key={s.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{s.image}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[s.status]}`}>
                        ● {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.port}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.cpu}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.memory}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.uptime}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Logs</button>
                        <button className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100">Restart</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'compose' && (
          <div className="p-4">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-[500px] font-mono">
              {composeContent}
            </pre>
          </div>
        )}

        {tab === 'logs' && (
          <div className="p-4">
            <div className="bg-gray-900 rounded-lg p-4 max-h-[400px] overflow-auto font-mono text-xs space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-gray-500 shrink-0">{log.time}</span>
                  <span className={`shrink-0 font-bold ${log.service === 'backend' ? 'text-blue-400' : log.service === 'frontend' ? 'text-purple-400' : log.service === 'postgres' ? 'text-yellow-400' : log.service === 'redis' ? 'text-red-400' : 'text-green-400'}`}>
                    [{log.service}]
                  </span>
                  <span className={log.level === 'error' ? 'text-red-400' : 'text-gray-300'}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
