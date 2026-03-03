'use client';

import { useState } from 'react';

const mockVisites = [
  { id: 'v1', title: 'Visite guidée Perroquets & Perruches', date: '2026-03-05', time: '10:00', duration: 90, guide: 'Marie Dupont', max: 15, current: 12, price: 18, status: 'CONFIRMED', type: 'GUIDED', zones: ['Volière A', 'Volière B'] },
  { id: 'v2', title: 'Découverte Reptiles de Guyane', date: '2026-03-05', time: '14:00', duration: 60, guide: 'Jean Martin', max: 10, current: 8, price: 15, status: 'CONFIRMED', type: 'GUIDED', zones: ['Reptilarium'] },
  { id: 'v3', title: 'Groupe scolaire — CE2 École Jules Ferry', date: '2026-03-07', time: '09:00', duration: 120, guide: 'Sophie Bernard', max: 30, current: 28, price: 8, status: 'CONFIRMED', type: 'SCHOOL', zones: ['Volière A', 'Reptilarium', 'Amphibiens'] },
  { id: 'v4', title: 'Visite privée famille Dupont', date: '2026-03-08', time: '11:00', duration: 120, guide: 'Marie Dupont', max: 6, current: 4, price: 45, status: 'PENDING', type: 'PRIVATE', zones: ['Volière A', 'Reptilarium'] },
  { id: 'v5', title: 'Soirée découverte nocturne', date: '2026-03-12', time: '19:00', duration: 90, guide: 'Jean Martin', max: 12, current: 7, price: 25, status: 'CONFIRMED', type: 'SPECIAL', zones: ['Reptilarium', 'Amphibiens'] },
];

const mockReservations = [
  { id: 'r1', visitTitle: 'Visite guidée Perroquets', date: '2026-03-05', client: 'Martin Famille', email: 'martin@email.fr', participants: 4, total: 72, status: 'CONFIRMED', payment: 'PAID' },
  { id: 'r2', visitTitle: 'Découverte Reptiles', date: '2026-03-05', client: 'Dubois Pierre', email: 'p.dubois@email.fr', participants: 2, total: 30, status: 'CONFIRMED', payment: 'PAID' },
  { id: 'r3', visitTitle: 'Visite privée famille', date: '2026-03-08', client: 'Dupont Jean-Paul', email: 'jp.dupont@email.fr', participants: 4, total: 180, status: 'PENDING', payment: 'PENDING' },
  { id: 'r4', visitTitle: 'Soirée nocturne', date: '2026-03-12', client: 'Leroy Sophie', email: 's.leroy@email.fr', participants: 3, total: 75, status: 'CONFIRMED', payment: 'PAID' },
];

const typeColors: Record<string, string> = {
  GUIDED: 'bg-forest-100 text-forest-800',
  SCHOOL: 'bg-blue-100 text-blue-800',
  PRIVATE: 'bg-gold-100 text-gold-800',
  SPECIAL: 'bg-purple-100 text-purple-800',
};

const typeLabels: Record<string, string> = {
  GUIDED: 'Guidée', SCHOOL: 'Scolaire', PRIVATE: 'Privée', SPECIAL: 'Spéciale',
};

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function TourismePage() {
  const [activeTab, setActiveTab] = useState<'visites' | 'reservations' | 'stats'>('visites');
  const [filterType, setFilterType] = useState('ALL');

  const filteredVisites = filterType === 'ALL' ? mockVisites : mockVisites.filter(v => v.type === filterType);

  const stats = {
    visitesToday: 3,
    participantsToday: 48,
    revenueMonth: 2840,
    pending: 2,
    avgRating: 4.7,
    occupancy: 82,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🌿 Tourisme & Visites</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestion des visites guidées, réservations et groupes scolaires</p>
        </div>
        <button className="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors text-sm font-medium">
          + Nouvelle visite
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Visites aujourd\'hui', value: stats.visitesToday, icon: '🗺️', color: 'text-forest-600' },
          { label: 'Participants', value: stats.participantsToday, icon: '👥', color: 'text-blue-600' },
          { label: 'CA du mois', value: `${stats.revenueMonth.toLocaleString()} €`, icon: '💰', color: 'text-gold-600' },
          { label: 'En attente', value: stats.pending, icon: '⏳', color: 'text-yellow-600' },
          { label: 'Note moyenne', value: `${stats.avgRating}/5`, icon: '⭐', color: 'text-purple-600' },
          { label: 'Taux remplissage', value: `${stats.occupancy}%`, icon: '📊', color: 'text-laterite-600' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {[
          { id: 'visites', label: '🗺️ Visites' },
          { id: 'reservations', label: '📋 Réservations' },
          { id: 'stats', label: '📊 Statistiques' },
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

      {/* Visites Tab */}
      {activeTab === 'visites' && (
        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex space-x-2">
            {['ALL', 'GUIDED', 'SCHOOL', 'PRIVATE', 'SPECIAL'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === type
                    ? 'bg-forest-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {type === 'ALL' ? 'Toutes' : typeLabels[type]}
              </button>
            ))}
          </div>

          {/* Liste des visites */}
          <div className="grid gap-4">
            {filteredVisites.map(visite => (
              <div key={visite.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{visite.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[visite.type]}`}>
                        {typeLabels[visite.type]}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[visite.status]}`}>
                        {visite.status === 'CONFIRMED' ? 'Confirmée' : 'En attente'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>📅 {visite.date} à {visite.time}</span>
                      <span>⏱️ {visite.duration} min</span>
                      <span>👤 Guide : {visite.guide}</span>
                      <span>💰 {visite.price} €/pers.</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {visite.zones.map(z => (
                        <span key={z} className="px-2 py-0.5 bg-maroni-50 dark:bg-maroni-900/20 text-maroni-700 dark:text-maroni-400 rounded text-xs">{z}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-forest-600">{visite.current}/{visite.max}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">participants</div>
                    <div className="mt-1 w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${visite.current / visite.max > 0.8 ? 'bg-red-500' : 'bg-forest-500'}`}
                        style={{ width: `${(visite.current / visite.max) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{Math.round((visite.current / visite.max) * 100)}% rempli</div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button className="px-3 py-1.5 text-xs bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400 rounded-lg hover:bg-forest-100 transition-colors">
                    Voir détail
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors">
                    Ajouter réservation
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                    Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Réservations Tab */}
      {activeTab === 'reservations' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Réservations récentes</h2>
            <button className="px-3 py-1.5 text-xs bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors">
              + Nouvelle réservation
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Visite', 'Date', 'Client', 'Participants', 'Total', 'Statut', 'Paiement', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {mockReservations.map(res => (
                  <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{res.visitTitle}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{res.date}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{res.client}</div>
                      <div className="text-xs text-gray-400">{res.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">{res.participants}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-forest-600">{res.total} €</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[res.status]}`}>
                        {res.status === 'CONFIRMED' ? 'Confirmée' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${res.payment === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {res.payment === 'PAID' ? 'Payé' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">✏️</button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">✅</button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">❌</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📈 Fréquentation par type</h3>
            <div className="space-y-3">
              {[
                { type: 'Guidée', count: 18, percent: 45, color: 'bg-forest-500' },
                { type: 'Scolaire', count: 12, percent: 30, color: 'bg-blue-500' },
                { type: 'Privée', count: 6, percent: 15, color: 'bg-gold-500' },
                { type: 'Spéciale', count: 4, percent: 10, color: 'bg-purple-500' },
              ].map(item => (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.type}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.count} visites ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">💰 Revenus mensuels</h3>
            <div className="space-y-2">
              {[
                { month: 'Oct 2025', revenue: 1840, visites: 14 },
                { month: 'Nov 2025', revenue: 2100, visites: 16 },
                { month: 'Déc 2025', revenue: 1650, visites: 12 },
                { month: 'Jan 2026', revenue: 2300, visites: 18 },
                { month: 'Fév 2026', revenue: 2580, visites: 21 },
                { month: 'Mar 2026', revenue: 2840, visites: 24 },
              ].map(item => (
                <div key={item.month} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-400">{item.visites} visites</span>
                    <span className="text-sm font-semibold text-forest-600">{item.revenue.toLocaleString()} €</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
