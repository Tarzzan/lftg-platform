'use client';
import { useState } from 'react';

const monthlyData = [
  { month: 'Mar 25', births: 8, deaths: 1, sales: 3, revenue: 12400 },
  { month: 'Avr 25', births: 12, deaths: 2, sales: 5, revenue: 18700 },
  { month: 'Mai 25', births: 7, deaths: 0, sales: 4, revenue: 15200 },
  { month: 'Juin 25', births: 15, deaths: 1, sales: 7, revenue: 24800 },
  { month: 'Juil 25', births: 10, deaths: 2, sales: 6, revenue: 21300 },
  { month: 'Aoû 25', births: 9, deaths: 1, sales: 5, revenue: 19500 },
  { month: 'Sep 25', births: 14, deaths: 0, sales: 8, revenue: 28100 },
  { month: 'Oct 25', births: 11, deaths: 1, sales: 6, revenue: 22400 },
  { month: 'Nov 25', births: 6, deaths: 2, sales: 4, revenue: 14700 },
  { month: 'Déc 25', births: 8, deaths: 1, sales: 5, revenue: 18900 },
  { month: 'Jan 26', births: 13, deaths: 0, sales: 7, revenue: 25600 },
  { month: 'Fév 26', births: 10, deaths: 1, sales: 6, revenue: 21800 },
];

const species = [
  { name: 'Pythons', count: 28, pct: 35, color: '#6366f1' },
  { name: 'Caméléons', count: 18, pct: 22, color: '#22c55e' },
  { name: 'Tortues', count: 15, pct: 19, color: '#f59e0b' },
  { name: 'Iguanes', count: 12, pct: 15, color: '#ec4899' },
  { name: 'Autres', count: 7, pct: 9, color: '#94a3b8' },
];

const kpis = [
  { label: 'Naissances (12 mois)', value: '123', trend: '+18%', up: true },
  { label: 'Taux de survie', value: '94.3%', trend: '+2.1%', up: true },
  { label: 'Chiffre d\'affaires', value: '243 500 €', trend: '+31%', up: true },
  { label: 'Animaux en stock', value: '80', trend: '-5', up: false },
];

const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

export default function AnalyticsPage() {
  const [metric, setMetric] = useState<'births' | 'revenue' | 'sales'>('births');

  const maxVal = Math.max(...monthlyData.map((d) => d[metric]));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Avancé</h1>
          <p className="text-gray-500 mt-1">KPIs historiques — tendances 12 mois</p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>12 derniers mois</option>
            <option>6 derniers mois</option>
            <option>Cette année</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
            ↓ Exporter
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{k.value}</p>
            <p className={`text-sm font-medium mt-1 ${k.up ? 'text-green-600' : 'text-red-500'}`}>
              {k.up ? '↑' : '↓'} {k.trend} vs an dernier
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Graphique barres */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Évolution mensuelle</h3>
            <div className="flex gap-2">
              {(['births', 'revenue', 'sales'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${metric === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {m === 'births' ? 'Naissances' : m === 'revenue' ? 'CA (€)' : 'Ventes'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-1 h-40">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all"
                  style={{ height: `${(d[metric] / maxVal) * 100}%` }}
                  title={`${d.month}: ${d[metric]}`}
                />
                <span className="text-xs text-gray-400 rotate-45 origin-left" style={{ fontSize: '9px' }}>{d.month.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition espèces */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Répartition par espèce</h3>
          <div className="space-y-3">
            {species.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{s.name}</span>
                  <span className="font-medium text-gray-900">{s.count} ({s.pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau récapitulatif */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Données mensuelles détaillées</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {['Mois', 'Naissances', 'Décès', 'Ventes', 'Chiffre d\'affaires'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthlyData.slice(-6).map((d) => (
                <tr key={d.month} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.month}</td>
                  <td className="px-4 py-3 text-green-700 font-medium">+{d.births}</td>
                  <td className="px-4 py-3 text-red-500">{d.deaths > 0 ? `-${d.deaths}` : '—'}</td>
                  <td className="px-4 py-3 text-blue-700">{d.sales}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{d.revenue.toLocaleString('fr-FR')} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
