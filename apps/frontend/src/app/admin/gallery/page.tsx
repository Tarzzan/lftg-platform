'use client';
import { useState } from 'react';

const photos = [
  { id: 'P001', animal: 'Kaa (Python réticulé)', tag: 'A042', date: '28 Fév 2026', size: '2.4 MB', url: '#', category: 'portrait' },
  { id: 'P002', animal: 'Léo (Caméléon de Parson)', tag: 'A018', date: '27 Fév 2026', size: '1.8 MB', url: '#', category: 'medical' },
  { id: 'P003', animal: 'Tortue géante A007', tag: 'A007', date: '26 Fév 2026', size: '3.1 MB', url: '#', category: 'portrait' },
  { id: 'P004', animal: 'Iguane vert A031', tag: 'A031', date: '25 Fév 2026', size: '2.0 MB', url: '#', category: 'comportement' },
  { id: 'P005', animal: 'Kaa (Python réticulé)', tag: 'A042', date: '24 Fév 2026', size: '1.5 MB', url: '#', category: 'medical' },
  { id: 'P006', animal: 'Caïman nain A055', tag: 'A055', date: '23 Fév 2026', size: '2.7 MB', url: '#', category: 'portrait' },
  { id: 'P007', animal: 'Gecko tokay A062', tag: 'A062', date: '22 Fév 2026', size: '1.2 MB', url: '#', category: 'portrait' },
  { id: 'P008', animal: 'Boa constrictor A039', tag: 'A039', date: '21 Fév 2026', size: '2.9 MB', url: '#', category: 'comportement' },
];

const categoryColors: Record<string, string> = {
  portrait: 'bg-blue-100 text-blue-700',
  medical: 'bg-red-100 text-red-700',
  comportement: 'bg-green-100 text-green-700',
};

const bgColors = ['bg-indigo-200', 'bg-green-200', 'bg-yellow-200', 'bg-pink-200', 'bg-blue-200', 'bg-orange-200', 'bg-teal-200', 'bg-purple-200'];

export default function GalleryPage() {
  const [filter, setFilter] = useState<'all' | 'portrait' | 'medical' | 'comportement'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filtered = filter === 'all' ? photos : photos.filter((p) => p.category === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galerie Photos</h1>
          <p className="text-gray-500 mt-1">Stockage AWS S3 — Reconnaissance d'espèces IA</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">AWS S3 us-east-1</span>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
            ↑ Téléverser
          </button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Photos totales', value: '847', color: 'text-blue-600' },
          { label: 'Stockage utilisé', value: '2.3 GB', color: 'text-green-600' },
          { label: 'Animaux photographiés', value: '72', color: 'text-purple-600' },
          { label: 'Identifications IA', value: '94.1%', color: 'text-orange-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres et vue */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'portrait', 'medical', 'comportement'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f === 'all' ? 'Toutes' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setView('grid')} className={`px-3 py-1 rounded text-sm ${view === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>⊞ Grille</button>
          <button onClick={() => setView('list')} className={`px-3 py-1 rounded text-sm ${view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>☰ Liste</button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className={`h-40 ${bgColors[i % bgColors.length]} flex items-center justify-center`}>
                <span className="text-4xl">🦎</span>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{p.animal}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{p.tag}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${categoryColors[p.category]}`}>{p.category}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{p.date} · {p.size}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {['Animal', 'Tag', 'Catégorie', 'Date', 'Taille', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.animal}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.tag}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[p.category]}`}>{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.date}</td>
                  <td className="px-4 py-3 text-gray-500">{p.size}</td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-blue-600 hover:underline mr-3">Voir</button>
                    <button className="text-xs text-red-500 hover:underline">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
