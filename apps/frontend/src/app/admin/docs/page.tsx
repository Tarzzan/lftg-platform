// @ts-nocheck
'use client';
import { useEffect, useRef, useState } from 'react';

export default function ApiDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiVersion, setApiVersion] = useState<string>('v4.0.0');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Vérifier que l'API est accessible
    fetch(`${apiUrl}/api-json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((spec) => {
        setApiVersion(spec?.info?.version ?? 'v4.0.0');
        setLoading(false);
      })
      .catch(() => {
        setError('Impossible de charger la spécification OpenAPI. Vérifiez que le backend est accessible.');
        setLoading(false);
      });
  }, [apiUrl]);

  const MODULES = [
    { module: 'Auth', endpoints: 7, icon: '🔐', color: 'blue' },
    { module: 'Animaux', endpoints: 12, icon: '🦜', color: 'green' },
    { module: 'Stock', endpoints: 8, icon: '📦', color: 'amber' },
    { module: 'Ventes', endpoints: 6, icon: '💰', color: 'purple' },
    { module: 'Formation', endpoints: 10, icon: '🎓', color: 'indigo' },
    { module: 'Workflows', endpoints: 7, icon: '⚙️', color: 'gray' },
    { module: 'Médical', endpoints: 8, icon: '🏥', color: 'red' },
    { module: 'Export', endpoints: 5, icon: '📄', color: 'teal' },
    { module: 'Contact', endpoints: 4, icon: '✉️', color: 'sky' },
    { module: 'Personnel', endpoints: 8, icon: '👥', color: 'orange' },
    { module: 'Notifications', endpoints: 3, icon: '🔔', color: 'yellow' },
    { module: 'Audit', endpoints: 2, icon: '🔍', color: 'slate' },
  ];

  const totalEndpoints = MODULES.reduce((s, m) => s + m.endpoints, 0);

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-white">Documentation API</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            LFTG Platform {apiVersion} — OpenAPI / Swagger
            {loading && <span className="ml-2 text-xs text-blue-500 animate-pulse">● Chargement...</span>}
            {!loading && !error && <span className="ml-2 text-xs text-green-600">● API connectée</span>}
            {error && <span className="ml-2 text-xs text-red-500">● {error}</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href={`${apiUrl}/api-json`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:bg-muted/20 dark:hover:bg-gray-700 transition-colors"
          >
            📥 JSON Spec
          </a>
          <a
            href={`${apiUrl}/api`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 transition-colors"
          >
            🔗 Ouvrir Swagger UI
          </a>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Endpoints documentés', value: totalEndpoints, icon: '🔌' },
          { label: 'Modules API', value: MODULES.length, icon: '📦' },
          { label: 'Version API', value: apiVersion, icon: '🏷️' },
        ].map((m) => (
          <div key={m.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-border dark:border-gray-700 p-4 flex items-center gap-3">
            <span className="text-2xl">{m.icon}</span>
            <div>
              <p className="text-xs text-gray-500">{m.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-foreground dark:text-white">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modules */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MODULES.map((m) => (
          <div
            key={m.module}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-border dark:border-gray-700 p-3 flex items-center gap-3 hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => window.open(`${apiUrl}/api#/${m.module}`, '_blank')}
          >
            <span className="text-xl">{m.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-foreground dark:text-white">{m.module}</p>
              <p className="text-xs text-gray-400">{m.endpoints} endpoints</p>
            </div>
          </div>
        ))}
      </div>

      {/* Iframe Swagger UI */}
      <div
        className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-border dark:border-gray-700 overflow-hidden relative"
        style={{ minHeight: '600px' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Chargement de la documentation API...</p>
            </div>
          </div>
        )}
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-4xl mb-4">⚠️</p>
              <p className="text-gray-700 dark:text-gray-300 dark:text-gray-300 font-medium">{error}</p>
              <a
                href={`${apiUrl}/api`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Ouvrir Swagger UI directement ↗
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src={`${apiUrl}/api`}
            className="w-full h-full border-none"
            style={{ minHeight: '600px' }}
            title="Swagger UI - LFTG Platform API"
            onLoad={() => setLoading(false)}
          />
        )}
      </div>
    </div>
  );
}
