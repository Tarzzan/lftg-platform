'use client';
import { useState } from 'react';

const tables = [
  { name: 'Animal', rows: 50, size: '1.2 MB', lastUpdated: '2026-03-01 12:00' },
  { name: 'Species', rows: 12, size: '48 KB', lastUpdated: '2026-03-01 12:00' },
  { name: 'Enclosure', rows: 8, size: '32 KB', lastUpdated: '2026-03-01 12:00' },
  { name: 'Clutch', rows: 10, size: '96 KB', lastUpdated: '2026-03-01 12:00' },
  { name: 'MedicalRecord', rows: 127, size: '512 KB', lastUpdated: '2026-03-01 12:00' },
  { name: 'User', rows: 5, size: '16 KB', lastUpdated: '2026-03-01 12:00' },
  { name: 'NutritionPlan', rows: 12, size: '64 KB', lastUpdated: '2026-03-01 12:00' },
  { name: 'GpsTracker', rows: 15, size: '128 KB', lastUpdated: '2026-03-01 12:00' },
  { name: 'IoTSensor', rows: 24, size: '256 KB', lastUpdated: '2026-03-01 12:00' },
  { name: 'Site', rows: 3, size: '12 KB', lastUpdated: '2026-03-01 12:00' },
];

const seedLogs = [
  { step: '✅ Rôles créés', count: 3, time: '0.12s' },
  { step: '✅ Utilisateurs créés', count: 5, time: '0.34s' },
  { step: '✅ Espèces créées', count: 12, time: '0.08s' },
  { step: '✅ Enclos créés', count: 8, time: '0.06s' },
  { step: '✅ 50 animaux créés', count: 50, time: '1.24s' },
  { step: '✅ 10 couvées créées', count: 10, time: '0.42s' },
  { step: '✅ Plans de nutrition créés', count: 12, time: '0.18s' },
  { step: '✅ 15 balises GPS créées', count: 15, time: '0.22s' },
  { step: '✅ Sites créés', count: 3, time: '0.05s' },
  { step: '🎉 Seed terminé avec succès !', count: 143, time: '2.71s' },
];

export default function DatabasePage() {
  const [tab, setTab] = useState<'tables' | 'seed' | 'migrations'>('tables');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de données Prisma</h1>
          <p className="text-gray-500 mt-1">PostgreSQL 15 — Schéma complet avec 30+ modèles</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            ↻ Prisma Studio
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
            ▶ Lancer le seed
          </button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tables Prisma', value: '30+', color: 'text-blue-600' },
          { label: 'Enregistrements', value: '1 250+', color: 'text-green-600' },
          { label: 'Taille totale', value: '~8 MB', color: 'text-purple-600' },
          { label: 'Migrations', value: '13', color: 'text-orange-600' },
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
          {(['tables', 'seed', 'migrations'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'tables' ? 'Tables' : t === 'seed' ? 'Seed de démo' : 'Migrations'}
            </button>
          ))}
        </div>

        {tab === 'tables' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Modèle Prisma', 'Enregistrements', 'Taille', 'Dernière mise à jour', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tables.map((t) => (
                  <tr key={t.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-blue-700">{t.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{t.rows}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{t.size}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{t.lastUpdated}</td>
                    <td className="px-4 py-3">
                      <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Voir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'seed' && (
          <div className="p-6">
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm space-y-2">
              <p className="text-green-400 font-bold">🌱 Seeding LFTG Platform database...</p>
              {seedLogs.map((log, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-300">{log.step}</span>
                  <div className="flex gap-4 text-gray-500 text-xs">
                    <span>{log.count} enr.</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Seed exécuté avec succès le <strong>01/03/2026 à 12:00:05</strong> — 143 enregistrements créés en 2.71s
            </p>
          </div>
        )}

        {tab === 'migrations' && (
          <div className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 13 }, (_, i) => i + 1).map((v) => (
                <div key={v} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="font-mono text-sm text-gray-700">
                    2026030{v < 10 ? '0' + v : v}_phase{v}_migration
                  </span>
                  <span className="ml-auto text-xs text-gray-400">Appliquée</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
