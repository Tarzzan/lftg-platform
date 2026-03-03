'use client';

import { useState } from 'react';
import { useDemoMode } from '@/lib/use-demo-mode';

const DEMO_PARTNERS = [
  { id: 'p1', name: 'CNRS Amazonie', type: 'Recherche', status: 'active', apiKey: 'lftg_pk_cnrs_••••••••••••4521', requests: 1247, lastUsed: 'Il y a 2h', permissions: ['animals:read', 'medical:read', 'gbif:read'] },
  { id: 'p2', name: 'Parc Amazonien de Guyane', type: 'Conservation', status: 'active', apiKey: 'lftg_pk_pag_••••••••••••8834', requests: 432, lastUsed: 'Il y a 1 jour', permissions: ['animals:read', 'cites:read'] },
  { id: 'p3', name: 'Université des Antilles', type: 'Éducation', status: 'active', apiKey: 'lftg_pk_ua_••••••••••••2291', requests: 89, lastUsed: 'Il y a 3 jours', permissions: ['animals:read', 'formation:read'] },
  { id: 'p4', name: 'WWF Guyane', type: 'ONG', status: 'suspended', apiKey: 'lftg_pk_wwf_••••••••••••6677', requests: 0, lastUsed: 'Il y a 30 jours', permissions: ['animals:read'] },
  { id: 'p5', name: 'Clinique Vétérinaire Tropicale', type: 'Vétérinaire', status: 'active', apiKey: 'lftg_pk_cvt_••••••••••••9912', requests: 2891, lastUsed: 'Il y a 30 min', permissions: ['animals:read', 'medical:read', 'medical:write'] },
];

const PERMISSIONS = [
  'animals:read', 'animals:write',
  'medical:read', 'medical:write',
  'cites:read', 'cites:write',
  'formation:read',
  'gbif:read',
  'stock:read',
  'reports:read',
];

export default function PartnersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', type: '', permissions: [] as string[] });

  // Afficher les données de démonstration uniquement en mode démo
  const isDemoMode = useDemoMode();
  const PARTNERS = isDemoMode ? DEMO_PARTNERS : [];
  const [selectedPartner, setSelectedPartner] = useState<typeof DEMO_PARTNERS[0] | null>(null);

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  };

  const typeColors: Record<string, string> = {
    Recherche: 'bg-purple-100 text-purple-700',
    Conservation: 'bg-green-100 text-green-700',
    Éducation: 'bg-blue-100 text-blue-700',
    ONG: 'bg-orange-100 text-orange-700',
    Vétérinaire: 'bg-teal-100 text-teal-700',
  };

  const togglePermission = (perm: string) => {
    setNewPartner(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl">🤝</span> API Partenaires
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestion des accès API partenaires et clés OAuth2</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Nouveau partenaire
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Partenaires actifs', value: PARTNERS.filter(p => p.status === 'active').length, icon: '✅', color: 'text-green-600' },
          { label: 'Total requêtes', value: PARTNERS.reduce((s, p) => s + p.requests, 0).toLocaleString('fr-FR'), icon: '📡', color: 'text-blue-600' },
          { label: 'Partenaires suspendus', value: PARTNERS.filter(p => p.status === 'suspended').length, icon: '🚫', color: 'text-red-600' },
          { label: 'Endpoints exposés', value: '24', icon: '🔌', color: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Liste des partenaires */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Partenaires enregistrés</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {PARTNERS.map(partner => (
            <div
              key={partner.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
              onClick={() => setSelectedPartner(selectedPartner?.id === partner.id ? null : partner)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-forest-100 dark:bg-forest-900/30 rounded-xl flex items-center justify-center text-xl">
                    {partner.type === 'Recherche' ? '🔬' : partner.type === 'Conservation' ? '🌿' : partner.type === 'Éducation' ? '🎓' : partner.type === 'ONG' ? '🌍' : '🏥'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{partner.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[partner.type] || 'bg-gray-100 text-gray-600'}`}>{partner.type}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[partner.status]}`}>{partner.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-gray-500 dark:text-gray-400">{partner.requests.toLocaleString('fr-FR')} requêtes</div>
                  <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">{partner.lastUsed}</div>
                </div>
              </div>

              {selectedPartner?.id === partner.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clé API</div>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-300 flex-1">{partner.apiKey}</span>
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Copier</button>
                      <button className="text-xs text-orange-600 hover:text-orange-800 font-medium">Renouveler</button>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions accordées</div>
                    <div className="flex flex-wrap gap-2">
                      {partner.permissions.map(perm => (
                        <span key={perm} className="text-xs bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-300 px-2 py-1 rounded-full font-mono">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                      Modifier les permissions
                    </button>
                    {partner.status === 'active' ? (
                      <button className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors">
                        Suspendre
                      </button>
                    ) : (
                      <button className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition-colors">
                        Réactiver
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Documentation API */}
      <div className="bg-forest-50 dark:bg-forest-900/20 border border-forest-200 dark:border-forest-700/50 rounded-xl p-6">
        <h3 className="font-semibold text-forest-800 dark:text-forest-200 mb-3">📖 Documentation API Partenaires</h3>
        <p className="text-forest-700 dark:text-forest-300 text-sm mb-4">
          L'API LFTG utilise l'authentification par clé API. Incluez votre clé dans l'en-tête <code className="bg-forest-100 dark:bg-forest-800 px-1 rounded">X-API-Key</code> de chaque requête.
        </p>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
          <div className="text-gray-500 mb-2"># Exemple de requête</div>
          <div>curl -H "X-API-Key: lftg_pk_your_key" \</div>
          <div className="ml-4">https://api.lftg.fr/animals</div>
        </div>
        <div className="mt-3 flex gap-3">
          <a href="/admin/docs" className="text-sm text-forest-600 dark:text-forest-400 hover:underline">→ Swagger UI complet</a>
          <span className="text-forest-400">·</span>
          <a href="#" className="text-sm text-forest-600 dark:text-forest-400 hover:underline">→ Guide d'intégration PDF</a>
        </div>
      </div>

      {/* Modal création partenaire */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nouveau partenaire</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'organisation</label>
                <input
                  type="text"
                  value={newPartner.name}
                  onChange={e => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: CNRS Amazonie"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={newPartner.type}
                  onChange={e => setNewPartner(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Sélectionner...</option>
                  {['Recherche', 'Conservation', 'Éducation', 'ONG', 'Vétérinaire', 'Commercial'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions API</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS.map(perm => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPartner.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="rounded"
                      />
                      <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Créer et générer les clés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
