'use client';

import { useState } from 'react';
import { useDemoMode } from '@/lib/use-demo-mode';

interface HistoryEntry {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  user: { name: string; avatar: string };
  timestamp: string;
  changes?: Record<string, { before: any; after: any }>;
}

const DEMO_HISTORY: HistoryEntry[] = [
  {
    id: '1', entityType: 'ANIMAL', entityId: 'a1', entityName: 'Amazona', action: 'UPDATE',
    user: { name: 'Marie Dupont', avatar: 'MD' }, timestamp: '2026-03-01T09:15:00',
    changes: { status: { before: 'ALIVE', after: 'CARE' }, weight: { before: 450, after: 430 }, notes: { before: 'RAS', after: 'Légère perte de poids observée' } },
  },
  {
    id: '2', entityType: 'STOCK_ARTICLE', entityId: 's1', entityName: 'Graines tropicales', action: 'UPDATE',
    user: { name: 'Jean Martin', avatar: 'JM' }, timestamp: '2026-03-01T08:30:00',
    changes: { quantity: { before: 120, after: 85 } },
  },
  {
    id: '3', entityType: 'SALE', entityId: 'v1', entityName: 'VT-2026-021', action: 'STATUS_CHANGE',
    user: { name: 'Pierre Leblanc', avatar: 'PL' }, timestamp: '2026-02-28T16:45:00',
    changes: { status: { before: 'CONFIRMED', after: 'COMPLETED' } },
  },
  {
    id: '4', entityType: 'ANIMAL', entityId: 'a2', entityName: 'Caïman #3', action: 'CREATE',
    user: { name: 'Dr. Rousseau', avatar: 'DR' }, timestamp: '2026-02-28T14:00:00',
    changes: undefined,
  },
  {
    id: '5', entityType: 'ENCLOSURE', entityId: 'e1', entityName: 'Volière A', action: 'UPDATE',
    user: { name: 'Marie Dupont', avatar: 'MD' }, timestamp: '2026-02-27T11:20:00',
    changes: { currentOccupancy: { before: 7, after: 8 }, description: { before: 'Volière standard', after: 'Grande volière dédiée aux perroquets et oiseaux tropicaux. Végétation dense avec arbres fruitiers natifs de Guyane.' } },
  },
  {
    id: '6', entityType: 'USER', entityId: 'u1', entityName: 'Sophie Bernard', action: 'CREATE',
    user: { name: 'Admin', avatar: 'AD' }, timestamp: '2026-02-26T09:00:00',
    changes: undefined,
  },
  {
    id: '7', entityType: 'ANIMAL', entityId: 'a3', entityName: 'Harpy', action: 'UPDATE',
    user: { name: 'Dr. Rousseau', avatar: 'DR' }, timestamp: '2026-02-25T15:30:00',
    changes: { status: { before: 'CARE', after: 'ALIVE' }, weight: { before: 3200, after: 3450 } },
  },
];

const ENTITY_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  ANIMAL: { emoji: '🦜', label: 'Animal', color: 'bg-green-100 text-green-700' },
  STOCK_ARTICLE: { emoji: '📦', label: 'Stock', color: 'bg-orange-100 text-orange-700' },
  SALE: { emoji: '💰', label: 'Vente', color: 'bg-yellow-100 text-yellow-700' },
  ENCLOSURE: { emoji: '🏠', label: 'Enclos', color: 'bg-blue-100 text-blue-700' },
  USER: { emoji: '👤', label: 'Utilisateur', color: 'bg-purple-100 text-purple-700' },
  MEDICAL_VISIT: { emoji: '🩺', label: 'Médical', color: 'bg-red-100 text-red-700' },
  WORKFLOW: { emoji: '⚙️', label: 'Workflow', color: 'bg-gray-100 text-gray-700' },
};

const ACTION_CONFIG = {
  CREATE: { label: 'Création', color: 'bg-green-100 text-green-700', icon: '✚' },
  UPDATE: { label: 'Modification', color: 'bg-blue-100 text-blue-700', icon: '✎' },
  DELETE: { label: 'Suppression', color: 'bg-red-100 text-red-700', icon: '✕' },
  STATUS_CHANGE: { label: 'Changement statut', color: 'bg-orange-100 text-orange-700', icon: '↻' },
};

function formatValue(value: any): string {
  if (value === null || value === undefined) return '(vide)';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  return String(value);
}

function DiffView({ field, before, after }: { field: string; before: any; after: any }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-xs py-1.5 border-b border-gray-100 last:border-0">
      <div className="font-medium text-gray-600 capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
      <div className="bg-red-50 text-red-700 px-2 py-1 rounded line-through opacity-70 truncate">
        {formatValue(before)}
      </div>
      <div className="bg-green-50 text-green-700 px-2 py-1 rounded font-medium truncate">
        {formatValue(after)}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [filterEntity, setFilterEntity] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');
  const [search, setSearch] = useState('');

  // Afficher les données de démonstration uniquement en mode démo
  const isDemoMode = useDemoMode();
  const HISTORY_DATA = isDemoMode ? DEMO_HISTORY : [];

  const filtered = HISTORY_DATA.filter(entry => {
    if (filterEntity !== 'ALL' && entry.entityType !== filterEntity) return false;
    if (filterAction !== 'ALL' && entry.action !== filterAction) return false;
    if (search && !entry.entityName.toLowerCase().includes(search.toLowerCase()) &&
        !entry.user.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📜 Historique des modifications</h1>
        <p className="text-gray-500 text-sm mt-1">Traçabilité complète de toutes les modifications</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500 focus:border-transparent w-48"
          />
          <select
            value={filterEntity}
            onChange={e => setFilterEntity(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500"
          >
            <option value="ALL">Toutes les entités</option>
            {Object.entries(ENTITY_CONFIG).map(([type, config]) => (
              <option key={type} value={type}>{config.emoji} {config.label}</option>
            ))}
          </select>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500"
          >
            <option value="ALL">Toutes les actions</option>
            {Object.entries(ACTION_CONFIG).map(([action, config]) => (
              <option key={action} value={action}>{config.icon} {config.label}</option>
            ))}
          </select>
          <div className="ml-auto text-sm text-gray-500 self-center">
            {filtered.length} entrée(s)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map(entry => {
            const entityConf = ENTITY_CONFIG[entry.entityType] || { emoji: '📄', label: entry.entityType, color: 'bg-gray-100 text-gray-700' };
            const actionConf = ACTION_CONFIG[entry.action];
            const isSelected = selectedEntry?.id === entry.id;

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(isSelected ? null : entry)}
                className={`bg-white rounded-xl border cursor-pointer transition-all ${
                  isSelected ? 'border-forest-400 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 bg-forest-100 text-forest-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {entry.user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entityConf.color}`}>
                          {entityConf.emoji} {entityConf.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionConf.color}`}>
                          {actionConf.icon} {actionConf.label}
                        </span>
                        <span className="font-semibold text-sm text-gray-900 truncate">{entry.entityName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{entry.user.name}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {entry.changes && (
                        <div className="mt-1 text-xs text-gray-500">
                          {Object.keys(entry.changes).length} champ(s) modifié(s) : {Object.keys(entry.changes).join(', ')}
                        </div>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isSelected ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Diff expandé */}
                  {isSelected && entry.changes && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-500 mb-2">
                        <div>Champ</div>
                        <div className="text-red-600">Avant</div>
                        <div className="text-green-600">Après</div>
                      </div>
                      {Object.entries(entry.changes).map(([field, { before, after }]) => (
                        <DiffView key={field} field={field} before={before} after={after} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📜</div>
              <p>Aucune entrée d&apos;historique trouvée</p>
            </div>
          )}
        </div>

        {/* Panneau stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Activité par type</h3>
            {HISTORY_DATA.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune activité</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(ENTITY_CONFIG).map(([type, config]) => {
                  const count = HISTORY_DATA.filter(e => e.entityType === type).length;
                  if (count === 0) return null;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-lg">{config.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{config.label}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-forest-500 h-1.5 rounded-full"
                            style={{ width: `${(count / HISTORY_DATA.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Activité par action</h3>
            {HISTORY_DATA.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune activité</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(ACTION_CONFIG).map(([action, config]) => {
                  const count = HISTORY_DATA.filter(e => e.action === action).length;
                  if (count === 0) return null;
                  return (
                    <div key={action} className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
                        {config.icon} {config.label}
                      </span>
                      <span className="font-semibold text-sm">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Utilisateurs actifs</h3>
            {HISTORY_DATA.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune activité</p>
            ) : (
              <div className="space-y-2">
                {[...new Set(HISTORY_DATA.map(e => e.user.name))].map(name => {
                  const count = HISTORY_DATA.filter(e => e.user.name === name).length;
                  const avatar = HISTORY_DATA.find(e => e.user.name === name)?.user.avatar || '';
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-forest-100 text-forest-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {avatar}
                      </div>
                      <span className="text-sm text-gray-700 flex-1">{name}</span>
                      <span className="text-xs font-medium text-gray-500">{count} action(s)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
