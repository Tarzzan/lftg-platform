'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const ENTITY_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  ANIMAL: { emoji: '🦜', label: 'Animal', color: 'bg-green-100 text-green-700' },
  SPECIES: { emoji: '🔬', label: 'Espèce', color: 'bg-blue-100 text-blue-700' },
  ENCLOSURE: { emoji: '🏠', label: 'Enclos', color: 'bg-amber-100 text-amber-700' },
  STOCK_ARTICLE: { emoji: '📦', label: 'Stock', color: 'bg-orange-100 text-orange-700' },
  SALE: { emoji: '💰', label: 'Vente', color: 'bg-purple-100 text-purple-700' },
  USER: { emoji: '👤', label: 'Utilisateur', color: 'bg-indigo-100 text-indigo-700' },
  MEDICAL_VISIT: { emoji: '🏥', label: 'Visite médicale', color: 'bg-red-100 text-red-700' },
  WORKFLOW: { emoji: '⚙️', label: 'Workflow', color: 'bg-gray-100 text-gray-700' },
};

const ACTION_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  CREATE: { icon: '✅', label: 'Création', color: 'text-green-600' },
  UPDATE: { icon: '✏️', label: 'Modification', color: 'text-blue-600' },
  DELETE: { icon: '🗑️', label: 'Suppression', color: 'text-red-600' },
  STATUS_CHANGE: { icon: '🔄', label: 'Changement de statut', color: 'text-amber-600' },
};

export default function HistoryPage() {
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [filterEntity, setFilterEntity] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data: historyData = [], isLoading } = useQuery({
    queryKey: ['history-recent'],
    queryFn: () => api.get('/history/recent?limit=200').then(r => r.data),
    refetchInterval: 30000,
  });

  const filtered = historyData.filter((entry: any) => {
    if (filterEntity !== 'ALL' && entry.entityType !== filterEntity) return false;
    if (filterAction !== 'ALL' && entry.action !== filterAction) return false;
    if (search) {
      const q = search.toLowerCase();
      const userName = entry.user?.name || '';
      const entityId = entry.entityId || '';
      if (!userName.toLowerCase().includes(q) && !entityId.toLowerCase().includes(q)) return false;
    }
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

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600" />
          <span className="ml-3 text-wood-500">Chargement de l'historique...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📜</p>
          <p className="text-gray-500">Aucune entrée dans l'historique pour le moment.</p>
          <p className="text-sm text-gray-400 mt-1">Les modifications apparaîtront ici au fur et à mesure.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((entry: any) => {
              const entityConf = ENTITY_CONFIG[entry.entityType] || { emoji: '📄', label: entry.entityType, color: 'bg-gray-100 text-gray-700' };
              const actionConf = ACTION_CONFIG[entry.action] || { icon: '📝', label: entry.action, color: 'text-gray-600' };
              const isSelected = selectedEntry?.id === entry.id;

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(isSelected ? null : entry)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${isSelected ? 'border-forest-400 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${entityConf.color}`}>
                      {entityConf.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${entityConf.color}`}>
                          {entityConf.label}
                        </span>
                        <span className={`text-xs font-medium ${actionConf.color}`}>
                          {actionConf.icon} {actionConf.label}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{entry.entityId?.slice(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-xs font-bold text-forest-700">
                          {(entry.user?.name || 'S')[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-600">{entry.user?.name || 'Système'}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && entry.changes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Modifications :</p>
                      <div className="space-y-1">
                        {Object.entries(entry.changes as Record<string, any>).map(([key, val]: [string, any]) => (
                          <div key={key} className="text-xs bg-gray-50 rounded p-2">
                            <span className="font-medium text-gray-700">{key}</span>
                            {val?.before !== undefined && (
                              <span className="ml-2 text-red-500 line-through">{String(val.before)}</span>
                            )}
                            {val?.after !== undefined && (
                              <span className="ml-2 text-green-600">{String(val.after)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Par type d'entité</h3>
              <div className="space-y-2">
                {Object.entries(ENTITY_CONFIG).map(([type, conf]) => {
                  const count = historyData.filter((e: any) => e.entityType === type).length;
                  if (count === 0) return null;
                  return (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{conf.emoji} {conf.label}</span>
                      <span className="font-semibold text-gray-800">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Par action</h3>
              <div className="space-y-2">
                {Object.entries(ACTION_CONFIG).map(([action, conf]) => {
                  const count = historyData.filter((e: any) => e.action === action).length;
                  if (count === 0) return null;
                  return (
                    <div key={action} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{conf.icon} {conf.label}</span>
                      <span className={`font-semibold ${conf.color}`}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
