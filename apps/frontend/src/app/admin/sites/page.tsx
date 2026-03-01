'use client';
import { useState } from 'react';

const sites = [
  {
    id: 'lftg-cayenne',
    name: 'LFTG Cayenne',
    location: 'Cayenne, Guyane Française',
    status: 'active',
    animals: 92,
    staff: 12,
    surface: '2.4 ha',
    revenue: 18400,
    alerts: 3,
    species: 28,
    enclosures: 14,
    visitors: 1247,
    coords: { lat: 4.9372, lng: -52.3260 },
  },
  {
    id: 'lftg-kourou',
    name: 'LFTG Kourou',
    location: 'Kourou, Guyane Française',
    status: 'active',
    animals: 34,
    staff: 5,
    surface: '0.8 ha',
    revenue: 6200,
    alerts: 1,
    species: 12,
    enclosures: 6,
    visitors: 423,
    coords: { lat: 5.1612, lng: -52.6479 },
  },
  {
    id: 'lftg-saint-laurent',
    name: 'LFTG Saint-Laurent',
    location: 'Saint-Laurent-du-Maroni, Guyane',
    status: 'planned',
    animals: 0,
    staff: 0,
    surface: '1.2 ha',
    revenue: 0,
    alerts: 0,
    species: 0,
    enclosures: 0,
    visitors: 0,
    coords: { lat: 5.4987, lng: -54.0334 },
  },
];

const transfers = [
  { id: 'TRF-001', animalId: 'AM-042', animalName: 'Ara Macao AM-042', from: 'LFTG Cayenne', to: 'LFTG Kourou', date: '2026-03-05', status: 'pending', reason: 'Reproduction — partenaire disponible à Kourou' },
  { id: 'TRF-002', animalId: 'TT-003', animalName: 'Tortue TT-003', from: 'LFTG Cayenne', to: 'LFTG Kourou', date: '2026-02-20', status: 'completed', reason: 'Espace enclos insuffisant à Cayenne' },
  { id: 'TRF-003', animalId: 'DA-012', animalName: 'Dendrobates DA-012', from: 'LFTG Kourou', to: 'LFTG Cayenne', date: '2026-01-15', status: 'completed', reason: 'Soins vétérinaires spécialisés' },
];

export default function SitesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transfers' | 'consolidated'>('overview');
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  const totalAnimals = sites.reduce((acc, s) => acc + s.animals, 0);
  const totalRevenue = sites.reduce((acc, s) => acc + s.revenue, 0);
  const totalVisitors = sites.reduce((acc, s) => acc + s.visitors, 0);
  const activeSites = sites.filter(s => s.status === 'active').length;

  const statusColor = (s: string) => {
    if (s === 'active') return 'bg-green-100 text-green-700';
    if (s === 'planned') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  const transferStatusColor = (s: string) => {
    if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (s === 'completed') return 'bg-green-100 text-green-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Multi-Sites</h1>
          <p className="text-gray-500 text-sm mt-1">Tableau de bord consolidé — Réseau LFTG Guyane</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          + Nouveau site
        </button>
      </div>

      {/* KPIs consolidés */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sites actifs', value: activeSites, icon: '🏛️', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Animaux total', value: totalAnimals, icon: '🐾', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Revenus mensuels', value: `${totalRevenue.toLocaleString()}€`, icon: '💰', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Visiteurs ce mois', value: totalVisitors.toLocaleString(), icon: '👥', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} rounded-xl p-4 border border-gray-100`}>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <span>{kpi.icon}</span>{kpi.label}
            </div>
            <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { key: 'overview', label: '🗺️ Vue d\'ensemble' },
          { key: 'transfers', label: '🔄 Transferts inter-sites' },
          { key: 'consolidated', label: '📊 Rapport consolidé' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-green-600 text-green-700 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {sites.map((site) => (
            <div
              key={site.id}
              className={`rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                selectedSite === site.id ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
              } ${site.status === 'planned' ? 'opacity-70' : ''}`}
              onClick={() => setSelectedSite(selectedSite === site.id ? null : site.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{site.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {site.location}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(site.status)}`}>
                  {site.status === 'active' ? '● Actif' : site.status === 'planned' ? '○ Planifié' : '○ Inactif'}
                </span>
              </div>

              {site.status === 'active' ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[
                      { label: 'Animaux', value: site.animals },
                      { label: 'Espèces', value: site.species },
                      { label: 'Enclos', value: site.enclosures },
                      { label: 'Staff', value: site.staff },
                    ].map((m) => (
                      <div key={m.label} className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-gray-800">{m.value}</div>
                        <div className="text-xs text-gray-500">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                    <span className="text-gray-500">Surface : <strong>{site.surface}</strong></span>
                    <span className="text-green-600 font-bold">{site.revenue.toLocaleString()}€/mois</span>
                  </div>
                  {site.alerts > 0 && (
                    <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      ⚠️ {site.alerts} alerte{site.alerts > 1 ? 's' : ''} active{site.alerts > 1 ? 's' : ''}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <div className="text-3xl mb-2">🏗️</div>
                  <p className="text-sm">Site en cours de planification</p>
                  <p className="text-xs mt-1">Surface prévue : {site.surface}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Transfers Tab */}
      {activeTab === 'transfers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Historique des transferts inter-sites</h3>
            <button className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700">
              + Nouveau transfert
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Réf.', 'Animal', 'De', 'Vers', 'Date', 'Raison', 'Statut'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{t.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{t.animalName}</td>
                    <td className="px-4 py-3 text-gray-600">{t.from}</td>
                    <td className="px-4 py-3 text-gray-600">{t.to}</td>
                    <td className="px-4 py-3 text-gray-500">{t.date}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs">{t.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${transferStatusColor(t.status)}`}>
                        {t.status === 'pending' ? '⏳ En attente' : t.status === 'completed' ? '✓ Complété' : '✗ Annulé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consolidated Tab */}
      {activeTab === 'consolidated' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">📊 Comparaison des sites</h3>
            <div className="space-y-4">
              {sites.filter(s => s.status === 'active').map((site) => (
                <div key={site.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{site.name}</span>
                    <span className="text-gray-500">{site.revenue.toLocaleString()}€ · {site.animals} animaux · {site.visitors} visiteurs</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${(site.revenue / totalRevenue) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{Math.round((site.revenue / totalRevenue) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total animaux réseau', value: totalAnimals, icon: '🐾', sub: 'Tous sites confondus' },
              { label: 'Revenus réseau', value: `${totalRevenue.toLocaleString()}€`, icon: '💰', sub: 'Ce mois-ci' },
              { label: 'Visiteurs réseau', value: totalVisitors.toLocaleString(), icon: '👥', sub: 'Ce mois-ci' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                <div className="text-xs text-gray-400">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
