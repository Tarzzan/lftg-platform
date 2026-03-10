'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';

interface Endpoint {
  method: string;
  path: string;
  tag: string;
  summary: string;
  auth: boolean;
  description?: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800 border-blue-200',
  POST: 'bg-green-100 text-green-800 border-green-200',
  PUT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
  PATCH: 'bg-purple-100 text-purple-800 border-purple-200',
};

// Endpoints statiques enrichis
const STATIC_ENDPOINTS: Endpoint[] = [
  // Auth
  { method: 'POST', path: '/api/v1/auth/login', tag: 'Auth', summary: 'Connexion utilisateur', auth: false },
  { method: 'POST', path: '/api/v1/auth/register', tag: 'Auth', summary: 'Inscription utilisateur', auth: false },
  { method: 'POST', path: '/api/v1/auth/refresh', tag: 'Auth', summary: 'Rafraîchir le token JWT', auth: false },
  { method: 'POST', path: '/api/v1/auth/logout', tag: 'Auth', summary: 'Déconnexion', auth: true },
  { method: 'GET', path: '/api/v1/auth/me', tag: 'Auth', summary: 'Profil utilisateur connecté', auth: true },
  { method: 'POST', path: '/api/v1/auth/2fa/generate', tag: 'Auth', summary: 'Générer secret 2FA', auth: true },
  { method: 'POST', path: '/api/v1/auth/2fa/verify', tag: 'Auth', summary: 'Vérifier token 2FA', auth: true },
  // Animaux
  { method: 'GET', path: '/api/v1/plugins/animaux/animals', tag: 'Animaux', summary: 'Liste des animaux', auth: true },
  { method: 'POST', path: '/api/v1/plugins/animaux/animals', tag: 'Animaux', summary: 'Créer un animal', auth: true },
  { method: 'GET', path: '/api/v1/plugins/animaux/animals/:id', tag: 'Animaux', summary: 'Détail d\'un animal', auth: true },
  { method: 'PATCH', path: '/api/v1/plugins/animaux/animals/:id', tag: 'Animaux', summary: 'Modifier un animal', auth: true },
  { method: 'DELETE', path: '/api/v1/plugins/animaux/animals/:id', tag: 'Animaux', summary: 'Supprimer un animal', auth: true },
  { method: 'GET', path: '/api/v1/plugins/animaux/species', tag: 'Animaux', summary: 'Liste des espèces', auth: true },
  { method: 'GET', path: '/api/v1/plugins/animaux/enclosures', tag: 'Animaux', summary: 'Liste des enclos', auth: true },
  { method: 'GET', path: '/api/v1/plugins/animaux/stats', tag: 'Animaux', summary: 'Statistiques animaux', auth: true },
  // Couvées
  { method: 'GET', path: '/api/v1/plugins/animaux/broods', tag: 'Couvées', summary: 'Liste des couvées', auth: true },
  { method: 'POST', path: '/api/v1/plugins/animaux/broods', tag: 'Couvées', summary: 'Créer une couvée', auth: true },
  { method: 'GET', path: '/api/v1/plugins/animaux/broods/:id', tag: 'Couvées', summary: 'Détail d\'une couvée', auth: true },
  { method: 'PATCH', path: '/api/v1/plugins/animaux/broods/:id', tag: 'Couvées', summary: 'Modifier une couvée', auth: true },
  // Personnel
  { method: 'GET', path: '/api/v1/plugins/personnel/employees', tag: 'Personnel', summary: 'Liste des employés', auth: true },
  { method: 'POST', path: '/api/v1/plugins/personnel/employees', tag: 'Personnel', summary: 'Créer un employé', auth: true },
  { method: 'GET', path: '/api/v1/plugins/personnel/employees/:id', tag: 'Personnel', summary: 'Détail d\'un employé', auth: true },
  { method: 'PATCH', path: '/api/v1/plugins/personnel/employees/:id', tag: 'Personnel', summary: 'Modifier un employé', auth: true },
  { method: 'DELETE', path: '/api/v1/plugins/personnel/employees/:id', tag: 'Personnel', summary: 'Supprimer un employé', auth: true },
  { method: 'GET', path: '/api/v1/plugins/personnel/leaves', tag: 'Personnel', summary: 'Liste des congés', auth: true },
  { method: 'POST', path: '/api/v1/plugins/personnel/leaves', tag: 'Personnel', summary: 'Créer un congé', auth: true },
  // Stock
  { method: 'GET', path: '/api/v1/plugins/stock/items', tag: 'Stock', summary: 'Liste des articles', auth: true },
  { method: 'POST', path: '/api/v1/plugins/stock/items', tag: 'Stock', summary: 'Créer un article', auth: true },
  { method: 'GET', path: '/api/v1/plugins/stock/items/alerts', tag: 'Stock', summary: 'Alertes stock faible', auth: true },
  { method: 'GET', path: '/api/v1/plugins/stock/movements', tag: 'Stock', summary: 'Mouvements de stock', auth: true },
  { method: 'POST', path: '/api/v1/plugins/stock/movements', tag: 'Stock', summary: 'Créer un mouvement', auth: true },
  // Formation
  { method: 'GET', path: '/api/v1/plugins/formation/courses', tag: 'Formation', summary: 'Liste des formations', auth: true },
  { method: 'POST', path: '/api/v1/plugins/formation/courses', tag: 'Formation', summary: 'Créer une formation', auth: true },
  { method: 'GET', path: '/api/v1/plugins/formation/enrollments', tag: 'Formation', summary: 'Liste des inscriptions', auth: true },
  { method: 'GET', path: '/api/v1/plugins/formation/stats', tag: 'Formation', summary: 'Statistiques formation', auth: true },
  // Contact
  { method: 'POST', path: '/api/v1/contact-messages/public', tag: 'Contact', summary: 'Envoyer un message (public)', auth: false },
  { method: 'GET', path: '/api/v1/contact-messages', tag: 'Contact', summary: 'Liste des messages (admin)', auth: true },
  { method: 'GET', path: '/api/v1/contact-messages/stats', tag: 'Contact', summary: 'Statistiques messages', auth: true },
  { method: 'PATCH', path: '/api/v1/contact-messages/:id/status', tag: 'Contact', summary: 'Changer le statut', auth: true },
  // Stats
  { method: 'GET', path: '/api/v1/stats/dashboard', tag: 'Stats', summary: 'Dashboard global', auth: true },
  { method: 'GET', path: '/api/v1/stats/animals/by-species', tag: 'Stats', summary: 'Animaux par espèce', auth: true },
  { method: 'GET', path: '/api/v1/stats/stock/evolution', tag: 'Stats', summary: 'Évolution du stock', auth: true },
  // Export
  { method: 'GET', path: '/api/v1/export/animaux/csv', tag: 'Export', summary: 'Exporter animaux en CSV', auth: true },
  { method: 'GET', path: '/api/v1/export/stock/csv', tag: 'Export', summary: 'Exporter stock en CSV', auth: true },
  { method: 'GET', path: '/api/v1/export/personnel/csv', tag: 'Export', summary: 'Exporter personnel en CSV', auth: true },
  { method: 'GET', path: '/api/v1/export/formation/csv', tag: 'Export', summary: 'Exporter formations en CSV', auth: true },
  { method: 'GET', path: '/api/v1/export/audit/csv', tag: 'Export', summary: 'Exporter journal d\'audit en CSV', auth: true },
  // Notifications
  { method: 'GET', path: '/api/v1/notifications/stream', tag: 'Notifications', summary: 'Flux SSE temps réel', auth: true },
  { method: 'GET', path: '/api/v1/notifications', tag: 'Notifications', summary: 'Liste des notifications', auth: true },
  // Workflows
  { method: 'GET', path: '/api/v1/workflows', tag: 'Workflows', summary: 'Liste des workflows', auth: true },
  { method: 'POST', path: '/api/v1/workflows', tag: 'Workflows', summary: 'Créer un workflow', auth: true },
  { method: 'POST', path: '/api/v1/workflows/:id/run', tag: 'Workflows', summary: 'Exécuter un workflow', auth: true },
  // Audit
  { method: 'GET', path: '/api/v1/audit', tag: 'Audit', summary: 'Journal d\'audit', auth: true },
];

const ALL_TAGS = ['Tous', ...Array.from(new Set(STATIC_ENDPOINTS.map((e) => e.tag)))];

export default function SwaggerPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [selectedTag, setSelectedTag] = useState('Tous');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [apiVersion, setApiVersion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/v1/health')
      .then((r) => r.json())
      .then((data) => setApiVersion(data?.version ?? 'v1'))
      .catch(() => setApiVersion('v1'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = STATIC_ENDPOINTS.filter((e) => {
    if (selectedTag !== 'Tous' && e.tag !== selectedTag) return false;
    if (search && !e.path.toLowerCase().includes(search.toLowerCase()) && !e.summary.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tagCounts = ALL_TAGS.reduce((acc, tag) => {
    acc[tag] = tag === 'Tous' ? STATIC_ENDPOINTS.length : STATIC_ENDPOINTS.filter((e) => e.tag === tag).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentation API</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            LFTG Platform API — {STATIC_ENDPOINTS.length} endpoints documentés
            {apiVersion && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">● API connectée</span>}
          </p>
        </div>
        <a
          href="http://51.210.15.92:3001/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          📚 Swagger UI complet
        </a>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total endpoints', value: STATIC_ENDPOINTS.length, color: 'text-blue-600' },
          { label: 'Modules', value: ALL_TAGS.length - 1, color: 'text-green-600' },
          { label: 'Endpoints publics', value: STATIC_ENDPOINTS.filter((e) => !e.auth).length, color: 'text-purple-600' },
          { label: 'Endpoints protégés', value: STATIC_ENDPOINTS.filter((e) => e.auth).length, color: 'text-orange-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-border shadow-sm">
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border shadow-sm p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
            >
              {tag} <span className="opacity-70">({tagCounts[tag]})</span>
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un endpoint ou une description..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Liste des endpoints */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-muted/20 px-4 py-3 border-b border-gray-200 dark:border-border">
          <p className="text-sm font-medium text-gray-700">
            {filtered.length} endpoint{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {filtered.map((endpoint) => {
            const key = `${endpoint.method}:${endpoint.path}`;
            const isExpanded = expandedEndpoint === key;
            return (
              <div key={key}>
                <button
                  onClick={() => setExpandedEndpoint(isExpanded ? null : key)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:bg-muted/20 text-left"
                >
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${METHOD_COLORS[endpoint.method] ?? 'bg-gray-100 text-gray-800 border-gray-200 dark:border-border'} min-w-[56px] text-center`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-sm text-gray-800 flex-1">{endpoint.path}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">{endpoint.summary}</span>
                  {endpoint.auth ? (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">🔒 Auth</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">Public</span>
                  )}
                  <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50 dark:bg-muted/20 border-t border-gray-100">
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-500">Module :</span>
                        <span className="font-medium text-gray-900">{endpoint.tag}</span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-500">Description :</span>
                        <span className="text-gray-700">{endpoint.summary}</span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-500">Authentification :</span>
                        <span className={endpoint.auth ? 'text-yellow-700 font-medium' : 'text-green-700 font-medium'}>
                          {endpoint.auth ? '🔒 Bearer JWT requis' : '✓ Accès public'}
                        </span>
                      </div>
                      <div className="mt-3">
                        <a
                          href={`http://51.210.15.92:3001/docs#/${endpoint.tag}/${endpoint.method.toLowerCase()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          → Tester dans Swagger UI ↗
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
