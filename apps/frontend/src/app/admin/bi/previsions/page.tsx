'use client';

import { useState } from 'react';

const historicalRevenue = [28500, 31200, 29800, 34100, 38600, 41200];
const forecastRevenue = [43800, 46500, 49200, 52100, 54800, 57600];
const months = ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'];
const forecastMonths = ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'];

const historicalPop = [210, 218, 225, 231, 240, 247];
const forecastPop = [254, 261, 268, 275, 282, 289];

const stockAlerts = [
  { article: 'Granulés perroquets', current: 12, unit: 'kg', daily: 0.8, daysLeft: 15, status: 'WARNING' },
  { article: 'Insectes vivants', current: 5000, unit: 'unités', daily: 200, daysLeft: 25, status: 'OK' },
  { article: 'Vitamines reptiles', current: 2, unit: 'flacons', daily: 0.05, daysLeft: 40, status: 'OK' },
  { article: 'Substrat terrarium', current: 3, unit: 'sacs', daily: 0.15, daysLeft: 20, status: 'WARNING' },
];

const visiteForecast = [
  { month: 'Oct', visites: 18, revenue: 5040 },
  { month: 'Nov', visites: 22, revenue: 6160 },
  { month: 'Déc', visites: 25, revenue: 7000 },
  { month: 'Jan', visites: 30, revenue: 8400 },
  { month: 'Fév', visites: 35, revenue: 9800 },
  { month: 'Mar', visites: 42, revenue: 11760 },
  { month: 'Avr (P)', visites: 49, revenue: 13720 },
  { month: 'Mai (P)', visites: 56, revenue: 15680 },
  { month: 'Juin (P)', visites: 63, revenue: 17640 },
  { month: 'Juil (P)', visites: 68, revenue: 19040 },
];

const maxRevenue = Math.max(...historicalRevenue, ...forecastRevenue);
const maxPop = Math.max(...historicalPop, ...forecastPop);
const maxVisites = Math.max(...visiteForecast.map(v => v.visites));

export default function PrevisionsPage() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'population' | 'stock' | 'tourisme'>('revenue');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔮 Prévisions & Analyses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Modèles prédictifs par régression linéaire — Horizon 6 mois</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
          <span>🤖</span>
          <span>Modèle : Régression linéaire (R² moyen : 0.94)</span>
        </div>
      </div>

      {/* KPIs prévisions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'CA prévu Avr', value: '43 800 €', trend: '+6.3%', icon: '💰', color: 'text-forest-600' },
          { label: 'Animaux prévus Avr', value: '254', trend: '+2.8%', icon: '🦜', color: 'text-blue-600' },
          { label: 'Visites prévues Avr', value: '49', trend: '+16.7%', icon: '🌿', color: 'text-purple-600' },
          { label: 'Alertes stock', value: '2', trend: 'critiques', icon: '📦', color: 'text-red-600' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</div>
            <div className="text-xs text-green-600 mt-1">↗ {kpi.trend}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {[
          { id: 'revenue', label: '💰 Revenus' },
          { id: 'population', label: '🦜 Population' },
          { id: 'stock', label: '📦 Stock' },
          { id: 'tourisme', label: '🌿 Tourisme' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-forest-700 dark:text-forest-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Revenus */}
      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Revenus historiques + prévisions</h3>
              <div className="flex items-center space-x-4 text-xs">
                <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-forest-500 rounded-full inline-block" /><span className="text-gray-500">Réel</span></span>
                <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-blue-400 rounded-full inline-block border-2 border-dashed border-blue-400" /><span className="text-gray-500">Prévu</span></span>
              </div>
            </div>
            {/* Graphique SVG */}
            <div className="relative h-48">
              <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
                {/* Grille */}
                {[0, 25, 50, 75, 100].map(p => (
                  <line key={p} x1="0" y1={180 - p * 1.8} x2="600" y2={180 - p * 1.8} stroke="#e5e7eb" strokeWidth="0.5" />
                ))}
                {/* Courbe historique */}
                <polyline
                  points={historicalRevenue.map((v, i) => `${i * 50 + 25},${180 - (v / maxRevenue) * 160}`).join(' ')}
                  fill="none" stroke="#16a34a" strokeWidth="2.5"
                />
                {historicalRevenue.map((v, i) => (
                  <circle key={i} cx={i * 50 + 25} cy={180 - (v / maxRevenue) * 160} r="4" fill="#16a34a" />
                ))}
                {/* Courbe prévision */}
                <polyline
                  points={[
                    `${5 * 50 + 25},${180 - (historicalRevenue[5] / maxRevenue) * 160}`,
                    ...forecastRevenue.map((v, i) => `${(i + 6) * 50 + 25},${180 - (v / maxRevenue) * 160}`)
                  ].join(' ')}
                  fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="6,3"
                />
                {forecastRevenue.map((v, i) => (
                  <circle key={i} cx={(i + 6) * 50 + 25} cy={180 - (v / maxRevenue) * 160} r="4" fill="#60a5fa" stroke="white" strokeWidth="1.5" />
                ))}
                {/* Zone de confiance */}
                <polygon
                  points={[
                    ...forecastRevenue.map((v, i) => `${(i + 6) * 50 + 25},${180 - (v * 1.1 / maxRevenue) * 160}`),
                    ...forecastRevenue.slice().reverse().map((v, i) => `${(forecastRevenue.length - 1 - i + 6) * 50 + 25},${180 - (v * 0.9 / maxRevenue) * 160}`)
                  ].join(' ')}
                  fill="#60a5fa" fillOpacity="0.1"
                />
              </svg>
              {/* Labels X */}
              <div className="flex justify-around mt-1 text-xs text-gray-400">
                {[...months, ...forecastMonths].map((m, i) => (
                  <span key={i} className={i >= 6 ? 'text-blue-400' : ''}>{m}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📊 Modèle prédictif</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Coefficient de corrélation (R²)</div>
                <div className="text-2xl font-bold text-forest-600">0.97</div>
                <div className="text-xs text-green-600">Excellent ajustement</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Croissance mensuelle moyenne</div>
                <div className="text-2xl font-bold text-blue-600">+2 540 €</div>
                <div className="text-xs text-gray-400">+6.2% par mois</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Projection annuelle</div>
                <div className="text-2xl font-bold text-purple-600">578 k€</div>
                <div className="text-xs text-green-600">↗ +38% vs N-1</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Pic prévu</div>
                <div className="text-2xl font-bold text-gold-600">Sep 2026</div>
                <div className="text-xs text-gray-400">57 600 € estimés</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Population */}
      {activeTab === 'population' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🦜 Évolution de la population animale</h3>
          <div className="relative h-48 mb-6">
            <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
              {[0, 25, 50, 75, 100].map(p => (
                <line key={p} x1="0" y1={180 - p * 1.8} x2="600" y2={180 - p * 1.8} stroke="#e5e7eb" strokeWidth="0.5" />
              ))}
              <polyline
                points={historicalPop.map((v, i) => `${i * 50 + 25},${180 - ((v - 200) / (maxPop - 200)) * 150}`).join(' ')}
                fill="none" stroke="#16a34a" strokeWidth="2.5"
              />
              {historicalPop.map((v, i) => (
                <circle key={i} cx={i * 50 + 25} cy={180 - ((v - 200) / (maxPop - 200)) * 150} r="4" fill="#16a34a" />
              ))}
              <polyline
                points={[
                  `${5 * 50 + 25},${180 - ((historicalPop[5] - 200) / (maxPop - 200)) * 150}`,
                  ...forecastPop.map((v, i) => `${(i + 6) * 50 + 25},${180 - ((v - 200) / (maxPop - 200)) * 150}`)
                ].join(' ')}
                fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="6,3"
              />
              {forecastPop.map((v, i) => (
                <circle key={i} cx={(i + 6) * 50 + 25} cy={180 - ((v - 200) / (maxPop - 200)) * 150} r="4" fill="#a78bfa" stroke="white" strokeWidth="1.5" />
              ))}
            </svg>
            <div className="flex justify-around mt-1 text-xs text-gray-400">
              {[...months, ...forecastMonths].map((m, i) => (
                <span key={i} className={i >= 6 ? 'text-purple-400' : ''}>{m}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Croissance mensuelle', value: '+7 animaux', color: 'text-forest-600' },
              { label: 'Population Avr 2026', value: '254', color: 'text-blue-600' },
              { label: 'Population Sep 2026', value: '289', color: 'text-purple-600' },
              { label: 'R² du modèle', value: '0.99', color: 'text-gold-600' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-gray-400 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📦 Prévisions de rupture de stock</h3>
            <div className="space-y-4">
              {stockAlerts.map(item => (
                <div key={item.article} className={`p-4 rounded-xl border ${item.status === 'WARNING' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-700' : 'border-gray-100 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{item.article}</span>
                      {item.status === 'WARNING' && <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">⚠️ Commande urgente</span>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">{item.daysLeft} jours</div>
                      <div className="text-xs text-gray-400">avant rupture</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.daysLeft < 20 ? 'bg-yellow-500' : 'bg-forest-500'}`}
                        style={{ width: `${Math.min((item.daysLeft / 60) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.current} {item.unit}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Consommation : {item.daily} {item.unit}/jour</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tourisme */}
      {activeTab === 'tourisme' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🌿 Prévisions de fréquentation touristique</h3>
          <div className="relative h-48 mb-6">
            <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
              {[0, 25, 50, 75, 100].map(p => (
                <line key={p} x1="0" y1={180 - p * 1.8} x2="600" y2={180 - p * 1.8} stroke="#e5e7eb" strokeWidth="0.5" />
              ))}
              {visiteForecast.map((v, i) => {
                const x = i * 60 + 30;
                const h = (v.visites / maxVisites) * 160;
                return (
                  <rect
                    key={i}
                    x={x - 20}
                    y={180 - h}
                    width={40}
                    height={h}
                    fill={i >= 6 ? '#60a5fa' : '#16a34a'}
                    fillOpacity={i >= 6 ? 0.7 : 1}
                    rx="3"
                  />
                );
              })}
            </svg>
            <div className="flex justify-around mt-1 text-xs text-gray-400">
              {visiteForecast.map((v, i) => (
                <span key={i} className={i >= 6 ? 'text-blue-400' : ''}>{v.month}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pic prévu', value: 'Juil 2026', sub: '68 visites', color: 'text-forest-600' },
              { label: 'Croissance mensuelle', value: '+7 visites', sub: '+16.7%', color: 'text-blue-600' },
              { label: 'Revenu Juil prévu', value: '19 040 €', sub: 'à 280€/visite', color: 'text-gold-600' },
              { label: 'R² du modèle', value: '0.98', sub: 'Excellent', color: 'text-purple-600' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-gray-400">{item.label}</div>
                <div className="text-xs text-green-600 mt-0.5">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
