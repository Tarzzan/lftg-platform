'use client';
import { useState } from 'react';

const listings = [
  { id: 'LST-001', type: 'sale', species: 'Ara macao', age: '3 ans', sex: 'M', price: 2500, seller: 'Élevage Tropical Martinique', location: 'Martinique', status: 'available', cites: 'Annexe I', certified: true, photo: '🦜', date: '2026-02-15' },
  { id: 'LST-002', type: 'exchange', species: 'Dendrobates azureus', age: '1 an', sex: 'F', price: 0, seller: 'Terrarium Passion Réunion', location: 'La Réunion', status: 'available', cites: 'Annexe II', certified: true, photo: '🐸', date: '2026-02-20' },
  { id: 'LST-003', type: 'sale', species: 'Boa constrictor', age: '2 ans', sex: 'M', price: 350, seller: 'Reptiles Guyane', location: 'Guyane', status: 'reserved', cites: 'Annexe II', certified: false, photo: '🐍', date: '2026-02-25' },
  { id: 'LST-004', type: 'wanted', species: 'Geochelone carbonaria', age: 'Adulte', sex: 'F', price: 800, seller: 'LFTG Cayenne', location: 'Guyane', status: 'available', cites: 'Annexe II', certified: true, photo: '🐢', date: '2026-03-01' },
  { id: 'LST-005', type: 'sale', species: 'Amazona amazonica', age: '5 ans', sex: 'F', price: 1800, seller: 'Perroquets des Antilles', location: 'Guadeloupe', status: 'available', cites: 'Annexe II', certified: true, photo: '🦜', date: '2026-02-28' },
];

const messages = [
  { id: 1, from: 'Élevage Tropical Martinique', subject: 'Re: Ara macao LST-001', preview: 'Bonjour, l\'animal est toujours disponible. Nous pouvons organiser...', date: 'il y a 2h', unread: true },
  { id: 2, from: 'Reptiles Guyane', subject: 'Intérêt pour Boa constrictor', preview: 'Nous avons un acheteur potentiel pour votre annonce...', date: 'il y a 1j', unread: false },
  { id: 3, from: 'Terrarium Passion Réunion', subject: 'Échange Dendrobates', preview: 'Suite à votre demande d\'échange, voici nos disponibilités...', date: 'il y a 3j', unread: false },
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'messages' | 'my-listings'>('listings');
  const [filterType, setFilterType] = useState('all');

  const typeColor = (t: string) => {
    if (t === 'sale') return 'bg-green-100 text-green-700';
    if (t === 'exchange') return 'bg-blue-100 text-blue-700';
    return 'bg-purple-100 text-purple-700';
  };

  const typeLabel = (t: string) => {
    if (t === 'sale') return '💰 Vente';
    if (t === 'exchange') return '🔄 Échange';
    return '🔍 Recherche';
  };

  const filteredListings = filterType === 'all' ? listings : listings.filter(l => l.type === filterType);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Éleveurs</h1>
          <p className="text-gray-500 text-sm mt-1">Plateforme d'échange entre éleveurs agréés — Animaux CITES uniquement</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          + Publier une annonce
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Annonces actives', value: listings.filter(l => l.status === 'available').length, icon: '📋', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Éleveurs inscrits', value: 47, icon: '🤝', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Messages non lus', value: messages.filter(m => m.unread).length, icon: '💬', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Échanges ce mois', value: 8, icon: '🔄', color: 'text-purple-600', bg: 'bg-purple-50' },
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
          { key: 'listings', label: '📋 Annonces' },
          { key: 'messages', label: `💬 Messages ${messages.filter(m => m.unread).length > 0 ? `(${messages.filter(m => m.unread).length})` : ''}` },
          { key: 'my-listings', label: '📌 Mes annonces' },
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

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div>
          <div className="flex gap-2 mb-4">
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'sale', label: '💰 Ventes' },
              { key: 'exchange', label: '🔄 Échanges' },
              { key: 'wanted', label: '🔍 Recherches' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === f.key ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredListings.map((listing) => (
              <div key={listing.id} className={`bg-white rounded-xl border-2 p-4 ${listing.status === 'reserved' ? 'border-yellow-200 opacity-75' : 'border-gray-200 hover:border-green-300'} transition-all`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{listing.photo}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{listing.species}</h3>
                      <p className="text-xs text-gray-500">{listing.age} · {listing.sex === 'M' ? '♂ Mâle' : '♀ Femelle'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(listing.type)}`}>
                      {typeLabel(listing.type)}
                    </span>
                    {listing.status === 'reserved' && (
                      <p className="text-xs text-yellow-600 mt-1">⏳ Réservé</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xs text-gray-500">📍 {listing.location}</p>
                    <p className="text-xs text-gray-500">👤 {listing.seller}</p>
                  </div>
                  <div className="text-right">
                    {listing.type === 'sale' && listing.price > 0 && (
                      <span className="text-xl font-bold text-green-600">{listing.price.toLocaleString()}€</span>
                    )}
                    {listing.type === 'exchange' && (
                      <span className="text-sm font-medium text-blue-600">Échange</span>
                    )}
                    {listing.type === 'wanted' && (
                      <span className="text-sm font-medium text-purple-600">Budget : {listing.price}€</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">CITES {listing.cites}</span>
                    {listing.certified && (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">✓ Certifié</span>
                    )}
                  </div>
                  <button className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">
                    Contacter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {messages.map((msg) => (
            <div key={msg.id} className={`p-4 hover:bg-gray-50 cursor-pointer ${msg.unread ? 'bg-blue-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {msg.unread && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>}
                  <div>
                    <p className={`text-sm ${msg.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.from}</p>
                    <p className="text-sm text-gray-600">{msg.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{msg.preview}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{msg.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Listings Tab */}
      {activeTab === 'my-listings' && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">📌</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune annonce publiée</h3>
          <p className="text-sm mb-4">Publiez votre première annonce pour vendre ou échanger des animaux</p>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
            + Publier une annonce
          </button>
        </div>
      )}
    </div>
  );
}
