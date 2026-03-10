'use client';
import { toast } from 'sonner';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const documentsApi = {
  list: (params?: any) => api.get('/documents', { params }).then(r => Array.isArray(r.data) ? r.data : (r.data?.items ?? r.data?.data ?? [])),
  delete: (id: string) => api.delete(`/documents/${id}`).then(r => r.data),
};

interface Document {
  id: string;
  name: string;
  category: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  linkedTo?: string;
  tags: string[];
  url?: string;
}


const CATEGORY_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  CITES: { emoji: '📜', color: 'bg-red-100 text-red-700', label: 'CITES' },
  MEDICAL: { emoji: '🩺', color: 'bg-blue-100 text-blue-700', label: 'Médical' },
  VENTE: { emoji: '💰', color: 'bg-yellow-100 text-yellow-700', label: 'Vente' },
  ESPECE: { emoji: '🦜', color: 'bg-green-100 text-green-700', label: 'Espèce' },
  ADMINISTRATIF: { emoji: '🏛️', color: 'bg-gray-100 text-gray-700', label: 'Administratif' },
  PROTOCOLE: { emoji: '📋', color: 'bg-purple-100 text-purple-700', label: 'Protocole' },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function DocumentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: allDocs = [], isLoading , isError } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });

  // Adapter les docs API au format attendu
  const docs = allDocs.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    category: doc.entityType?.toUpperCase() || 'AUTRE',
    size: doc.size || 0,
    uploadedAt: doc.createdAt || new Date().toISOString(),
    uploadedBy: doc.uploadedBy?.name || 'Système',
    linkedTo: doc.entityId || undefined,
    tags: [],
    url: doc.url,
  }));

  const filtered = docs.filter((doc: any) => {
    if (filterCategory !== 'ALL' && doc.category !== filterCategory) return false;
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalSize = docs.reduce((sum: number, d: any) => sum + d.size, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📁 Gestion des documents</h1>
          <p className="text-gray-500 text-sm mt-1">{isLoading ? 'Chargement...' : `${docs.length} document${docs.length !== 1 ? 's' : ''} · ${formatSize(totalSize)} au total`}</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 transition-colors">
          + Uploader un document
        </button>
      </div>

      {/* Zone de drag-and-drop */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging ? 'border-forest-500 bg-forest-50' : 'border-gray-300 hover:border-forest-400 hover:bg-gray-50'
        }`}
        onClick={() => setShowUploadModal(true)}
      >
        <div className="text-4xl mb-2">📤</div>
        <p className="text-gray-600 font-medium">Glissez-déposez vos fichiers ici</p>
        <p className="text-sm text-gray-400 mt-1">PDF, images, Word, Excel — max 10 Mo par fichier</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Rechercher un document..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500 w-56"
        />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCategory === 'ALL' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            Tous
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([cat, conf]) => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterCategory === cat ? conf.color + ' border-current' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {conf.emoji} {conf.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          {(['grid', 'list'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`p-2 rounded-lg transition-colors ${viewMode === mode ? 'bg-forest-100 text-forest-700' : 'hover:bg-gray-100 text-gray-500'}`}>
              {mode === 'grid' ? '⊞' : '☰'}
            </button>
          ))}
        </div>
      </div>

      {/* Grille / Liste */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(doc => {
            const catConf = CATEGORY_CONFIG[doc.category] || { emoji: '📄', color: 'bg-gray-100 text-gray-700', label: doc.category };
            return (
              <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-forest-300 hover:shadow-sm transition-all cursor-pointer group">
                <div className="text-4xl mb-3 text-center">{catConf.emoji}</div>
                <div className="text-sm font-medium text-gray-900 truncate text-center" title={doc.name}>{doc.name}</div>
                <div className={`mt-2 text-xs px-2 py-0.5 rounded-full text-center ${catConf.color}`}>{catConf.label}</div>
                <div className="mt-2 text-xs text-gray-400 text-center">{formatSize(doc.size)}</div>
                {doc.linkedTo && <div className="mt-1 text-xs text-forest-600 text-center truncate">{doc.linkedTo}</div>}
                <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex-1 text-xs py-1 bg-forest-50 text-forest-700 rounded hover:bg-forest-100 transition-colors">Voir</button>
                  <button className="flex-1 text-xs py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors">⬇</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Nom', 'Catégorie', 'Lié à', 'Taille', 'Date', 'Uploadé par', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(doc => {
                const catConf = CATEGORY_CONFIG[doc.category] || { emoji: '📄', color: 'bg-gray-100 text-gray-700', label: doc.category };
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{catConf.emoji}</span>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${catConf.color}`}>{catConf.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{doc.linkedTo || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatSize(doc.size)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{doc.uploadedBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-xs px-2 py-1 bg-forest-50 text-forest-700 rounded hover:bg-forest-100">Voir</button>
                        <button className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100">⬇</button>
                        <button className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Uploader un document</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="text-4xl mb-2">📤</div>
                <p className="text-sm text-gray-600">Cliquez pour sélectionner un fichier</p>
                <input type="file" className="hidden" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500">
                  {Object.entries(CATEGORY_CONFIG).map(([cat, conf]) => (
                    <option key={cat} value={cat}>{conf.emoji} {conf.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lié à (optionnel)</label>
                <input type="text" placeholder="Animal, vente, enclos..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par des virgules)</label>
                <input type="text" placeholder="cites, permis, annexe-ii" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500" />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowUploadModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
              <button onClick={() => setShowUploadModal(false)} className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700">Uploader</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
