'use client';
import { useState } from 'react';

const endpoints = [
  { method: 'POST', path: '/api/v1/auth/login', tag: 'Auth', summary: 'Connexion utilisateur', auth: false },
  { method: 'POST', path: '/api/v1/auth/register', tag: 'Auth', summary: 'Inscription utilisateur', auth: false },
  { method: 'POST', path: '/api/v1/auth/refresh', tag: 'Auth', summary: 'Rafraîchir le token JWT', auth: false },
  { method: 'POST', path: '/api/v1/auth/logout', tag: 'Auth', summary: 'Déconnexion', auth: true },
  { method: 'GET', path: '/api/v1/auth/me', tag: 'Auth', summary: 'Profil utilisateur connecté', auth: true },
  { method: 'POST', path: '/api/v1/auth/2fa/generate', tag: 'Auth', summary: 'Générer secret 2FA', auth: true },
  { method: 'POST', path: '/api/v1/auth/2fa/verify', tag: 'Auth', summary: 'Vérifier token 2FA', auth: true },
  { method: 'GET', path: '/api/v1/animals', tag: 'Animaux', summary: 'Liste des animaux', auth: true },
  { method: 'POST', path: '/api/v1/animals', tag: 'Animaux', summary: 'Créer un animal', auth: true },
  { method: 'GET', path: '/api/v1/animals/:id', tag: 'Animaux', summary: 'Détail d\'un animal', auth: true },
  { method: 'PUT', path: '/api/v1/animals/:id', tag: 'Animaux', summary: 'Modifier un animal', auth: true },
  { method: 'DELETE', path: '/api/v1/animals/:id', tag: 'Animaux', summary: 'Supprimer un animal', auth: true },
  { method: 'GET', path: '/api/v1/iot/sensors', tag: 'IoT', summary: 'Liste des capteurs IoT', auth: true },
  { method: 'GET', path: '/api/v1/iot/sensors/:id/readings', tag: 'IoT', summary: 'Lectures d\'un capteur', auth: true },
  { method: 'GET', path: '/api/v1/gps/trackers', tag: 'GPS', summary: 'Liste des balises GPS', auth: true },
  { method: 'GET', path: '/api/v1/export/animaux/csv', tag: 'Export', summary: 'Exporter animaux en CSV', auth: true },
  { method: 'GET', path: '/api/v1/export/stock/csv', tag: 'Export', summary: 'Exporter stock en CSV', auth: true },
];

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800',
  POST: 'bg-green-100 text-green-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
  PATCH: 'bg-purple-100 text-purple-800',
};

const tags = ['Tous', 'Auth', 'Animaux', 'IoT', 'GPS', 'Export'];

export default function SwaggerPage() {
  const [selectedTag, setSelectedTag] = useState('Tous');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  const filtered = selectedTag === 'Tous' ? endpoints : endpoints.filter(e => e.tag === selectedTag);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentation API Swagger</h1>
          <p className="text-gray-500 mt-1">OpenAPI 3.1 — LFTG Platform API v13.0.0</p>
        </div>
        <a
          href="http://localhost:3001/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          Ouvrir Swagger UI ↗
        </a>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Endpoints documentés', value: '120+', color: 'text-blue-600' },
          { label: 'Tags / Groupes', value: '28', color: 'text-green-600' },
          { label: 'Schémas OpenAPI', value: '85+', color: 'text-purple-600' },
          { label: 'Version API', value: 'v13.0.0', color: 'text-orange-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres par tag */}
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTag === tag ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Liste des endpoints */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.map((ep) => (
            <div key={`${ep.method}-${ep.path}`}>
              <button
                onClick={() => setExpandedEndpoint(expandedEndpoint === `${ep.method}-${ep.path}` ? null : `${ep.method}-${ep.path}`)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 text-left"
              >
                <span className={`px-2 py-1 rounded text-xs font-bold font-mono w-16 text-center ${methodColors[ep.method]}`}>
                  {ep.method}
                </span>
                <span className="font-mono text-sm text-gray-700 flex-1">{ep.path}</span>
                <span className="text-sm text-gray-500">{ep.summary}</span>
                <div className="flex gap-2 ml-auto">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{ep.tag}</span>
                  {ep.auth && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">🔒 JWT</span>}
                </div>
              </button>

              {expandedEndpoint === `${ep.method}-${ep.path}` && (
                <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                      <p className="text-sm text-gray-700">{ep.summary}</p>
                    </div>
                    {ep.auth && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          <strong>Authentification requise</strong> — Incluez le token JWT dans l'en-tête : <code className="font-mono">Authorization: Bearer &lt;token&gt;</code>
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Réponse 200</p>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
                        {`{ "status": "success", "data": { ... } }`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
