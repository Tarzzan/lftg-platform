'use client';

import { useState } from 'react';
import { useDemoMode } from '@/lib/use-demo-mode';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const DEMO_REVENUE_DATA = [
  { month: 'Sep', revenue: 28400, expenses: 18200, profit: 10200 },
  { month: 'Oct', revenue: 31200, expenses: 19800, profit: 11400 },
  { month: 'Nov', revenue: 29800, expenses: 17500, profit: 12300 },
  { month: 'Déc', revenue: 38500, expenses: 22100, profit: 16400 },
  { month: 'Jan', revenue: 34800, expenses: 20300, profit: 14500 },
  { month: 'Fév', revenue: 41250, expenses: 23400, profit: 17850 },
];

const DEMO_FORECAST_DATA = [
  { month: 'Mar', predicted: 43200, confidence: 90 },
  { month: 'Avr', predicted: 45800, confidence: 85 },
  { month: 'Mai', predicted: 48100, confidence: 80 },
  { month: 'Jun', predicted: 51300, confidence: 74 },
  { month: 'Jul', predicted: 53900, confidence: 68 },
  { month: 'Aoû', predicted: 56400, confidence: 62 },
];

const DEMO_SPECIES_DATA = [
  { species: 'Amazona', count: 45, healthy: 43, sick: 2 },
  { species: 'Ara', count: 32, healthy: 32, sick: 0 },
  { species: 'Dendrobates', count: 28, healthy: 27, sick: 1 },
  { species: 'Boa', count: 18, healthy: 18, sick: 0 },
  { species: 'Iguana', count: 22, healthy: 21, sick: 1 },
  { species: 'Autres', count: 102, healthy: 98, sick: 4 },
];

const DEMO_REVENUE_CATEGORY = [
  { name: 'Ventes animaux', value: 28750, color: '#2d6a4f' },
  { name: 'Formations', value: 7200, color: '#40916c' },
  { name: 'Consultations', value: 3800, color: '#52b788' },
  { name: 'Autres', value: 1500, color: '#95d5b2' },
];

const DEMO_HEALTH_TREND = Array.from({ length: 30 }, (_, i) => ({
  day: `J-${29 - i}`,
  healthy: Math.round(240 + Math.random() * 8),
  sick: Math.round(3 + Math.random() * 4),
  observation: Math.round(2 + Math.random() * 3),
}));

const DEMO_RADAR_DATA = [
  { metric: 'Santé animale', score: 97 },
  { metric: 'Conformité CITES', score: 97 },
  { metric: 'Présence RH', score: 94 },
  { metric: 'Stock', score: 78 },
  { metric: 'Ventes', score: 88 },
  { metric: 'Formations', score: 85 },
];

const DEMO_KPIS = [
  { label: 'Chiffre d\'affaires', value: '41 250 €', change: '+18.5%', trend: 'up', icon: '💰', color: 'forest' },
  { label: 'Animaux vivants', value: '247', change: '+12', trend: 'up', icon: '🦜', color: 'maroni' },
  { label: 'Taux de réussite couvées', value: '78.4%', change: '+3.2%', trend: 'up', icon: '🥚', color: 'gold' },
  { label: 'Conformité CITES', value: '96.8%', change: '+0.8%', trend: 'up', icon: '📋', color: 'forest' },
  { label: 'Présence personnel', value: '94.5%', change: '+1.5%', trend: 'up', icon: '👥', color: 'laterite' },
  { label: 'Tickets ouverts', value: '3', change: '-2', trend: 'down', icon: '🎫', color: 'maroni' },
  { label: 'Valeur du stock', value: '18 750 €', change: '-2.1%', trend: 'down', icon: '📦', color: 'gold' },
  { label: 'Marge bénéficiaire', value: '43.3%', change: '+2.1%', trend: 'up', icon: '📈', color: 'forest' },
];

const PERIODS = ['Semaine', 'Mois', 'Trimestre', 'Année'];

export default function BiPage() {
  const [period, setPeriod] = useState('Mois');
  const [activeTab, setActiveTab] = useState('overview');

  // Afficher les données de démonstration uniquement en mode démo
  const isDemoMode = useDemoMode();
  const REVENUE_DATA = isDemoMode ? DEMO_REVENUE_DATA : [];
  const FORECAST_DATA = isDemoMode ? DEMO_FORECAST_DATA : [];
  const SPECIES_DATA = isDemoMode ? DEMO_SPECIES_DATA : [];
  const REVENUE_CATEGORY = isDemoMode ? DEMO_REVENUE_CATEGORY : [];
  const HEALTH_TREND = isDemoMode ? DEMO_HEALTH_TREND : [];
  const RADAR_DATA = isDemoMode ? DEMO_RADAR_DATA : [];
  const KPIS = isDemoMode ? DEMO_KPIS : [];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'revenue', label: 'Revenus & Prévisions' },
    { id: 'animals', label: 'Animaux & Santé' },
    { id: 'performance', label: 'Performance globale' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wood-900">Tableau de Bord BI</h1>
          <p className="text-sm text-wood-500 mt-1">Analytique avancée et indicateurs de performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-wood-100 rounded-lg p-1">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${period === p ? 'bg-white text-forest-700 font-semibold shadow-sm' : 'text-wood-600 hover:text-wood-900'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="btn-primary text-sm px-4 py-2">
            📊 Exporter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-wood-100 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white text-forest-700 font-semibold shadow-sm' : 'text-wood-600 hover:text-wood-900'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPIS.map((kpi, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {kpi.trend === 'up' ? '▲' : '▼'} {kpi.change}
              </span>
            </div>
            <p className="text-xl font-bold text-wood-900">{kpi.value}</p>
            <p className="text-xs text-wood-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Expenses */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">Revenus vs Dépenses (6 mois)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c1440e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#c1440e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k€`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} €`} />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Revenus" stroke="#2d6a4f" fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" name="Dépenses" stroke="#c1440e" fill="url(#colorExpenses)" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" name="Bénéfice" stroke="#d4a017" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by category */}
          <div className="card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">Répartition des revenus</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={REVENUE_CATEGORY} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {REVENUE_CATEGORY.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} €`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {REVENUE_CATEGORY.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-wood-600">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-wood-800">{((cat.value / 41250) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Animals by species */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">Animaux par espèce — Santé</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={SPECIES_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="species" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="healthy" name="En bonne santé" fill="#2d6a4f" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="sick" name="Malades" fill="#c1440e" stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance radar */}
          <div className="card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">Score global de performance</h2>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="#e8e0d5" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#2d6a4f" fill="#2d6a4f" fillOpacity={0.3} />
                <Tooltip formatter={(v: number) => `${v}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forecast */}
          <div className="card p-6">
            <h2 className="font-semibold text-wood-800 mb-1">Prévisions de revenus (6 mois)</h2>
            <p className="text-xs text-wood-500 mb-4">Modèle de régression linéaire · R² = 0.87</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={FORECAST_DATA}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4a017" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k€`} />
                <Tooltip formatter={(v: number, name: string) => name === 'predicted' ? `${v.toLocaleString('fr-FR')} €` : `${v}%`} />
                <Legend />
                <Area type="monotone" dataKey="predicted" name="Prévision" stroke="#d4a017" fill="url(#colorForecast)" strokeWidth={2} strokeDasharray="6 3" />
                <Line type="monotone" dataKey="confidence" name="Confiance (%)" stroke="#52b788" strokeWidth={1} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly comparison */}
          <div className="card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">Bénéfice mensuel</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k€`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} €`} />
                <Bar dataKey="profit" name="Bénéfice" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue table */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">Détail mensuel</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-wood-200">
                  <th className="text-left py-2 text-wood-600 font-medium">Mois</th>
                  <th className="text-right py-2 text-wood-600 font-medium">Revenus</th>
                  <th className="text-right py-2 text-wood-600 font-medium">Dépenses</th>
                  <th className="text-right py-2 text-wood-600 font-medium">Bénéfice</th>
                  <th className="text-right py-2 text-wood-600 font-medium">Marge</th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-wood-100 hover:bg-wood-50">
                    <td className="py-3 font-medium text-wood-800">{row.month} 2025{row.month === 'Jan' || row.month === 'Fév' ? '/26' : ''}</td>
                    <td className="py-3 text-right text-green-700 font-semibold">{row.revenue.toLocaleString('fr-FR')} €</td>
                    <td className="py-3 text-right text-red-600">{row.expenses.toLocaleString('fr-FR')} €</td>
                    <td className="py-3 text-right text-forest-700 font-bold">{row.profit.toLocaleString('fr-FR')} €</td>
                    <td className="py-3 text-right">
                      <span className="bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {((row.profit / row.revenue) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'animals' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health trend */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">Tendance de santé — 30 derniers jours</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={HEALTH_TREND.filter((_, i) => i % 3 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="healthy" name="En bonne santé" stroke="#2d6a4f" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sick" name="Malades" stroke="#c1440e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="observation" name="En observation" stroke="#d4a017" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Species stats table */}
          <div className="card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">Statistiques par espèce</h2>
            <div className="space-y-3">
              {SPECIES_DATA.map((sp, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-wood-700">{sp.species}</span>
                    <span className="text-xs text-wood-500">{sp.count} animaux</span>
                  </div>
                  <div className="h-2 bg-wood-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-forest-500 rounded-full"
                      style={{ width: `${(sp.healthy / sp.count) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-wood-400 mt-0.5">
                    <span>{sp.healthy} sains</span>
                    {sp.sick > 0 && <span className="text-red-500">{sp.sick} malades</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brood stats */}
          <div className="card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">Statistiques couvées</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Couvées actives', value: '12', icon: '🥚' },
                { label: 'Taux d\'éclosion', value: '78.4%', icon: '🐣' },
                { label: 'Œufs en cours', value: '38', icon: '🔵' },
                { label: 'Nés ce mois', value: '11', icon: '🐦' },
              ].map((stat, i) => (
                <div key={i} className="bg-wood-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-lg font-bold text-wood-900">{stat.value}</div>
                  <div className="text-xs text-wood-500">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { species: 'Amazona amazonica', rate: 78.6, eggs: 14, hatched: 11 },
                { species: 'Ara chloropterus', rate: 88.9, eggs: 9, hatched: 8 },
                { species: 'Dendrobates tinctorius', rate: 73.3, eggs: 15, hatched: 11 },
              ].map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-wood-600 truncate">{b.species}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-wood-500 text-xs">{b.hatched}/{b.eggs}</span>
                    <span className={`font-semibold ${b.rate >= 80 ? 'text-green-600' : 'text-amber-600'}`}>{b.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">Radar de performance</h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="#e8e0d5" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <Radar name="Score actuel" dataKey="score" stroke="#2d6a4f" fill="#2d6a4f" fillOpacity={0.3} />
                <Tooltip formatter={(v: number) => `${v}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">Top performers</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { title: 'Meilleure espèce', name: 'Ara chloropterus', metric: '100% santé', icon: '🦜', score: 100 },
                { title: 'Meilleur employé', name: 'Marie Dupont', metric: '98% présence', icon: '👩‍🔬', score: 98 },
                { title: 'Meilleur enclos', name: 'Volière B', metric: '0 incident', icon: '🏡', score: 100 },
              ].map((p, i) => (
                <div key={i} className="bg-gradient-to-br from-forest-50 to-forest-100 rounded-xl p-4 text-center border border-forest-200">
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <div className="text-xs text-forest-600 font-medium mb-1">{p.title}</div>
                  <div className="font-bold text-wood-900 text-sm">{p.name}</div>
                  <div className="text-xs text-forest-700 mt-1">{p.metric}</div>
                  <div className="mt-2 bg-forest-200 rounded-full h-1.5">
                    <div className="bg-forest-600 h-1.5 rounded-full" style={{ width: `${p.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-wood-700 text-sm mb-3">Alertes & Actions recommandées</h3>
            <div className="space-y-2">
              {[
                { level: 'critical', icon: '🔴', text: 'Stock graines tournesol critique — Commander immédiatement', action: 'Commander' },
                { level: 'warning', icon: '🟡', text: 'Serrure Volière A défectueuse — Intervention requise', action: 'Ticket' },
                { level: 'warning', icon: '🟡', text: 'Dendrobate en observation — Suivi médical requis', action: 'Médical' },
                { level: 'info', icon: '🔵', text: 'Permis CITES #P-2024-089 expire dans 45 jours', action: 'Renouveler' },
              ].map((alert, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                  alert.level === 'critical' ? 'bg-red-50 border border-red-200' :
                  alert.level === 'warning' ? 'bg-amber-50 border border-amber-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{alert.icon}</span>
                    <span className="text-wood-700">{alert.text}</span>
                  </div>
                  <button className="text-xs font-semibold text-forest-700 hover:text-forest-900 whitespace-nowrap ml-3">
                    {alert.action} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
