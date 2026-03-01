'use client';

import { useEffect, useRef } from 'react';

export default function ApiDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Charger Swagger UI dynamiquement
    const loadSwaggerUI = async () => {
      const SwaggerUI = (await import('swagger-ui-react')).default;
      await import('swagger-ui-react/swagger-ui.css');

      const { createRoot } = await import('react-dom/client');
      const root = createRoot(containerRef.current!);
      root.render(
        SwaggerUI({
          url: `${apiUrl}/api-json`,
          docExpansion: 'list',
          filter: true,
          tryItOutEnabled: true,
          requestInterceptor: (req: any) => {
            const token = localStorage.getItem('lftg_token');
            if (token) req.headers.Authorization = `Bearer ${token}`;
            return req;
          },
        })
      );
    };

    loadSwaggerUI().catch(() => {
      // Fallback : iframe vers Swagger UI externe
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
        containerRef.current.appendChild(iframe);
      }
    });
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documentation API</h1>
          <p className="text-sm text-gray-500 mt-1">LFTG Platform v4.0.0 — OpenAPI / Swagger</p>
        </div>
        <div className="flex gap-3">
          <a
            href={`${apiUrl}/api-json`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

      {/* Résumé des endpoints */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { module: 'Auth', endpoints: 4, icon: '🔐', color: 'blue' },
          { module: 'Animaux', endpoints: 12, icon: '🦜', color: 'green' },
          { module: 'Stock', endpoints: 8, icon: '📦', color: 'amber' },
          { module: 'Ventes', endpoints: 6, icon: '💰', color: 'purple' },
          { module: 'Formation', endpoints: 10, icon: '🎓', color: 'indigo' },
          { module: 'Workflows', endpoints: 7, icon: '⚙️', color: 'gray' },
          { module: 'Médical', endpoints: 8, icon: '🏥', color: 'red' },
          { module: 'Export', endpoints: 5, icon: '📄', color: 'teal' },
        ].map(m => (
          <div key={m.module} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
            <span className="text-xl">{m.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.module}</p>
              <p className="text-xs text-gray-400">{m.endpoints} endpoints</p>
            </div>
          </div>
        ))}
      </div>

      {/* Iframe Swagger UI */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ minHeight: '600px' }}>
        <iframe
          src={`${apiUrl}/api`}
          className="w-full h-full border-none"
          style={{ minHeight: '600px' }}
          title="Swagger UI - LFTG Platform API"
        />
      </div>
    </div>
  );
}
