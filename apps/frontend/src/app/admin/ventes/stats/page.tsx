'use client';

import { useState } from 'react';

const MONTHLY_REVENUE = [
  { month: 'Sep', revenue: 4200, count: 8, avg: 525 },
  { month: 'Oct', revenue: 5800, count: 11, avg: 527 },
  { month: 'Nov', revenue: 7100, count: 14, avg: 507 },
  { month: 'Déc', revenue: 9200, count: 18, avg: 511 },
  { month: 'Jan', revenue: 6400, count: 12, avg: 533 },
  { month: 'Fév', revenue: 8300, count: 16, avg: 519 },
];

const TOP_SPECIES = [
  { name: 'Amazone à front bleu', count: 24, revenue: 14400, pct: 32 },
  { name: 'Dendrobate azureus', count: 18, revenue: 5400, pct: 24 },
  { name: 'Caïman à lunettes', count: 8, revenue: 9600, pct: 11 },
  { name: 'Ara ararauna', count: 6, revenue: 8400, pct: 8 },
  { name: 'Harpie féroce', count: 3, revenue: 7500, pct: 4 },
];

const CUSTOMER_TYPES = [
  { type: 'Particuliers', count: 45, revenue: 22500, pct: 60 },
  { type: 'Zoos & Parcs', count: 12, revenue: 18000, pct: 16 },
  { type: 'Éleveurs', count: 18, revenue: 9000, pct: 24 },
];

const maxRevenue = Math.max(...MONTHLY_REVENUE.map(m => m.revenue));

export default function VentesStatsPage() {
  const [period, setPeriod] = useState('6m');

  const totalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0);
  const totalCount = MONTHLY_REVENUE.reduce((s, m) => s + m.count, 0);
  const avgRevenue = Math.round(totalRevenue / totalCount);
  const growth = Math.round(((MONTHLY_REVENUE[5].revenue - MONTHLY_REVENUE[0].revenue) / MONTHLY_REVENUE[0].revenue) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Statistiques des ventes</h1>
          <p className="text-gray-500 text-sm mt-1">Analyse détaillée des performances commerciales</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['3m', '6m', '1a', 'Tout'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${period === p ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Chiffre d\'affaires', value: `${(totalRevenue / 1000).toFixed(1)}k €`, sub: `+${growth}% vs période préc.`, color: 'text-forest-600', positive: true },
          { label: 'Nombre de ventes', value: totalCount, sub: `${(totalCount / 6).toFixed(1)} / mois`, color: 'text-blue-600', positive: true },
          { label: 'Panier moyen', value: `${avgRevenue} €`, sub: 'Par transaction', color: 'text-purple-600', positive: null },
          { label: 'Meilleur mois', value: `${(Math.max(...MONTHLY_REVENUE.map(m => m.revenue)) / 1000).toFixed(1)}k €`, sub: 'Décembre 2025', color: 'text-gold-600', positive: null },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
            <div className={`text-xs mt-1 font-medium ${kpi.positive === true ? 'text-green-600' : kpi.positive === false ? 'text-red-600' : 'text-gray-400'}`}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique revenus mensuels */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Évolution mensuelle du CA</h3>
          <div className="flex items-end gap-3 h-48">
            {MONTHLY_REVENUE.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-medium text-gray-700">{(m.revenue / 1000).toFixed(1)}k</div>
                <div
                  className="w-full rounded-t-lg transition-all hover:opacity-80"
                  style={{
                    height: `${(m.revenue / maxRevenue) * 160}px`,
                    background: i === MONTHLY_REVENUE.length - 1
                      ? 'linear-gradient(to top, #1a5c38, #2d7a4f)'
                      : 'linear-gradient(to top, #86efac, #4ade80)',
                  }}
                />
                <div className="text-xs text-gray-500">{m.month}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-400" />
              <span>Mois précédents</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-forest-600" />
              <span>Mois en cours</span>
            </div>
          </div>
        </div>

        {/* Répartition par type de client */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Répartition clients</h3>
          {/* Donut SVG */}
          <div className="flex justify-center mb-4">
            <svg width="140" height="140" viewBox="0 0 140 140">
              {(() => {
                const cx = 70, cy = 70, r = 50, strokeWidth = 20;
                const circumference = 2 * Math.PI * r;
                let offset = 0;
                const colors = ['#1a5c38', '#c4661a', '#0891b2'];
                return CUSTOMER_TYPES.map((ct, i) => {
                  const dash = (ct.pct / 100) * circumference;
                  const gap = circumference - dash;
                  const rotation = -90 + (offset / 100) * 360;
                  offset += ct.pct;
                  return (
                    <circle
                      key={ct.type}
                      cx={cx} cy={cy} r={r}
                      fill="none"
                      stroke={colors[i]}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${dash} ${gap}`}
                      transform={`rotate(${rotation} ${cx} ${cy})`}
                    />
                  );
                });
              })()}
              <text x="70" y="66" textAnchor="middle" className="text-lg font-bold" style={{ fontSize: '18px', fontWeight: 'bold', fill: '#1a5c38' }}>{totalCount}</text>
              <text x="70" y="82" textAnchor="middle" style={{ fontSize: '10px', fill: '#6b7280' }}>ventes</text>
            </svg>
          </div>
          <div className="space-y-3">
            {CUSTOMER_TYPES.map((ct, i) => (
              <div key={ct.type} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ['#1a5c38', '#c4661a', '#0891b2'][i] }} />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{ct.type}</span>
                    <span className="font-medium">{ct.pct}%</span>
                  </div>
                  <div className="text-xs text-gray-400">{ct.count} ventes · {ct.revenue.toLocaleString('fr-FR')} €</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top espèces vendues */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Top espèces vendues</h3>
        <div className="space-y-4">
          {TOP_SPECIES.map((sp, i) => (
            <div key={sp.name} className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{sp.name}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-500">{sp.count} ventes</span>
                    <span className="font-semibold text-forest-700">{sp.revenue.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-forest-400 to-forest-600"
                    style={{ width: `${sp.pct}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-400 w-8 text-right">{sp.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
