'use client';
import { useState } from 'react';

const exports = [
  { name: 'Animaux', endpoint: '/api/v1/export/animaux/csv', format: 'CSV', rows: 50, size: '12 KB', lastExport: '2026-03-01 11:30' },
  { name: 'Stock alimentaire', endpoint: '/api/v1/export/stock/csv', format: 'CSV', rows: 87, size: '18 KB', lastExport: '2026-03-01 10:15' },
  { name: 'Personnel', endpoint: '/api/v1/export/personnel/csv', format: 'CSV', rows: 12, size: '6 KB', lastExport: '2026-02-28 16:00' },
  { name: 'Journal d\'audit', endpoint: '/api/v1/export/audit/csv', format: 'CSV', rows: 1000, size: '245 KB', lastExport: '2026-03-01 12:00' },
  { name: 'Formations', endpoint: '/api/v1/export/formation/csv', format: 'CSV', rows: 34, size: '9 KB', lastExport: '2026-02-27 09:00' },
  { name: 'Rapport CITES', endpoint: '/api/v1/advanced-reports/cites', format: 'PDF', rows: null, size: '~500 KB', lastExport: '2026-02-28 14:00' },
  { name: 'Bilan annuel 2025', endpoint: '/api/v1/advanced-reports/annual', format: 'PDF', rows: null, size: '~1.2 MB', lastExport: '2026-01-15 09:00' },
];

const history = [
  { date: '2026-03-01 12:00', user: 'admin@lftg.fr', type: 'Journal d\'audit', format: 'CSV', size: '245 KB', status: 'success' },
  { date: '2026-03-01 11:30', user: 'admin@lftg.fr', type: 'Animaux', format: 'CSV', size: '12 KB', status: 'success' },
  { date: '2026-03-01 10:15', user: 'soigneur@lftg.fr', type: 'Stock alimentaire', format: 'CSV', size: '18 KB', status: 'success' },
  { date: '2026-02-28 16:00', user: 'admin@lftg.fr', type: 'Personnel', format: 'CSV', size: '6 KB', status: 'success' },
  { date: '2026-02-28 14:00', user: 'admin@lftg.fr', type: 'Rapport CITES', format: 'PDF', size: '498 KB', status: 'success' },
];

export default function ExportPage() {
  const [tab, setTab] = useState<'exports' | 'history'>('exports');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export de données</h1>
          <p className="text-gray-500 mt-1">CSV, Excel, PDF — Streaming fast-csv</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">fast-csv</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">BOM UTF-8</span>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Types d\'export', value: '7', color: 'text-blue-600' },
          { label: 'Exports ce mois', value: '42', color: 'text-green-600' },
          { label: 'Volume exporté', value: '~15 MB', color: 'text-purple-600' },
          { label: 'Formats supportés', value: 'CSV, PDF', color: 'text-orange-600' },
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
          {(['exports', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'exports' ? 'Exports disponibles' : 'Historique'}
            </button>
          ))}
        </div>

        {tab === 'exports' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Type de données', 'Endpoint', 'Format', 'Lignes', 'Taille', 'Dernier export', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exports.map((ex) => (
                  <tr key={ex.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{ex.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{ex.endpoint}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${ex.format === 'CSV' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                        {ex.format}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{ex.rows ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{ex.size}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{ex.lastExport}</td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        ↓ Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Date', 'Utilisateur', 'Type', 'Format', 'Taille', 'Statut'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{h.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{h.user}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{h.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${h.format === 'CSV' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                        {h.format}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{h.size}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">✓ {h.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
