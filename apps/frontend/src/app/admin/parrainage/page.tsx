'use client';

import { useState } from 'react';

const sponsorships = [
  {
    id: 'sp-1',
    sponsorName: 'Famille Martin',
    sponsorEmail: 'martin.famille@email.fr',
    animalId: 'AM-042',
    animalName: 'Ara Macao AM-042',
    species: 'Ara macao',
    amount: 25,
    frequency: 'monthly',
    startDate: '2025-06-01',
    nextPayment: '2026-04-01',
    status: 'active',
    totalPaid: 250,
    certificate: true,
    updates: 3,
  },
  {
    id: 'sp-2',
    sponsorName: 'Entreprise EcoGuiane',
    sponsorEmail: 'contact@ecoguiane.fr',
    animalId: 'DA-012',
    animalName: 'Dendrobates azureus DA-012',
    species: 'Dendrobates azureus',
    amount: 50,
    frequency: 'monthly',
    startDate: '2025-09-01',
    nextPayment: '2026-04-01',
    status: 'active',
    totalPaid: 350,
    certificate: true,
    updates: 2,
  },
  {
    id: 'sp-3',
    sponsorName: 'Jean-Paul Beaumont',
    sponsorEmail: 'jpbeaumont@gmail.com',
    animalId: 'TT-003',
    animalName: 'Tortue Carbonaria TT-003',
    species: 'Geochelone carbonaria',
    amount: 15,
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextPayment: '2026-04-01',
    status: 'active',
    totalPaid: 45,
    certificate: false,
    updates: 1,
  },
  {
    id: 'sp-4',
    sponsorName: 'Sophie Leblanc',
    sponsorEmail: 'sophie.l@hotmail.fr',
    animalId: 'AM-017',
    animalName: 'Ara Chloropterus AM-017',
    species: 'Ara chloropterus',
    amount: 25,
    frequency: 'monthly',
    startDate: '2025-03-01',
    nextPayment: '2026-04-01',
    status: 'paused',
    totalPaid: 300,
    certificate: true,
    updates: 5,
  },
  {
    id: 'sp-5',
    sponsorName: 'Lycée Félix Éboué',
    sponsorEmail: 'direction@lycee-eboue.fr',
    animalId: 'AM-031',
    animalName: 'Amazone AM-031',
    species: 'Amazona amazonica',
    amount: 30,
    frequency: 'monthly',
    startDate: '2025-09-01',
    nextPayment: '2026-04-01',
    status: 'active',
    totalPaid: 210,
    certificate: true,
    updates: 2,
  },
];

const animals = [
  { id: 'AM-042', name: 'Ara Macao AM-042', species: 'Ara macao', sponsored: true, icon: '🦜' },
  { id: 'DA-012', name: 'Dendrobates azureus DA-012', species: 'Dendrobates azureus', sponsored: true, icon: '🐸' },
  { id: 'TT-003', name: 'Tortue Carbonaria TT-003', species: 'Geochelone carbonaria', sponsored: true, icon: '🐢' },
  { id: 'AM-017', name: 'Ara Chloropterus AM-017', species: 'Ara chloropterus', sponsored: true, icon: '🦜' },
  { id: 'AM-031', name: 'Amazone AM-031', species: 'Amazona amazonica', sponsored: true, icon: '🦜' },
  { id: 'BC-001', name: 'Boa Constrictor BC-001', species: 'Boa constrictor', sponsored: false, icon: '🐍' },
  { id: 'PR-007', name: 'Python Royal PR-007', species: 'Python regius', sponsored: false, icon: '🐍' },
  { id: 'DA-023', name: 'Dendrobates tinctorius DA-023', species: 'Dendrobates tinctorius', sponsored: false, icon: '🐸' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Actif', color: 'text-green-700', bg: 'bg-green-100' },
  paused: { label: 'Suspendu', color: 'text-amber-700', bg: 'bg-amber-100' },
  cancelled: { label: 'Annulé', color: 'text-red-700', bg: 'bg-red-100' },
};

export default function ParrainagePage() {
  const [tab, setTab] = useState<'sponsorships' | 'animals' | 'stats'>('sponsorships');
  const [search, setSearch] = useState('');

  const filtered = sponsorships.filter(s =>
    s.sponsorName.toLowerCase().includes(search.toLowerCase()) ||
    s.animalName.toLowerCase().includes(search.toLowerCase())
  );

  const totalMonthly = sponsorships.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0);
  const totalCollected = sponsorships.reduce((sum, s) => sum + s.totalPaid, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Parrainage</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des parrainages d'animaux</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 text-sm font-medium">
          + Nouveau parrainage
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Parrainages actifs', value: sponsorships.filter(s => s.status === 'active').length, icon: '❤️', color: 'text-red-600' },
          { label: 'Revenus mensuels', value: `${totalMonthly}€`, icon: '💰', color: 'text-green-700' },
          { label: 'Total collecté', value: `${totalCollected}€`, icon: '📊', color: 'text-blue-700' },
          { label: 'Animaux parrainés', value: animals.filter(a => a.sponsored).length, icon: '🐾', color: 'text-forest-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['sponsorships', 'animals', 'stats'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'sponsorships' ? '❤️ Parrainages' : t === 'animals' ? '🐾 Animaux' : '📊 Statistiques'}
          </button>
        ))}
      </div>

      {tab === 'sponsorships' && (
        <>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un parrain ou un animal..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          <div className="space-y-3">
            {filtered.map(sp => {
              const cfg = statusConfig[sp.status];
              return (
                <div key={sp.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center text-xl shrink-0">
                        ❤️
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{sp.sponsorName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          {sp.certificate && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">🏆 Certificat</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{sp.sponsorEmail}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                          <span>🐾 {sp.animalName}</span>
                          <span>💰 {sp.amount}€/mois</span>
                          <span>📅 Depuis {new Date(sp.startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                          <span>📬 {sp.updates} mise{sp.updates > 1 ? 's' : ''} à jour</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-forest-700">{sp.totalPaid}€</div>
                      <div className="text-xs text-gray-400">total versé</div>
                      <div className="flex gap-2 mt-2">
                        <button className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">
                          📧 Contacter
                        </button>
                        <button className="text-xs px-2 py-1 bg-forest-600 text-white rounded-lg hover:bg-forest-700">
                          Voir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'animals' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {animals.map(a => (
            <div key={a.id} className={`bg-white rounded-xl border p-5 ${a.sponsored ? 'border-forest-200' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{a.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{a.id}</div>
                    <div className="text-xs text-gray-500 italic">{a.species}</div>
                  </div>
                </div>
                {a.sponsored ? (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">❤️ Parrainé</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Disponible</span>
                )}
              </div>
              {a.sponsored ? (
                <div className="text-xs text-gray-500">
                  Parrain : <span className="font-medium text-gray-700">
                    {sponsorships.find(s => s.animalId === a.id)?.sponsorName}
                  </span>
                </div>
              ) : (
                <button className="w-full mt-2 py-2 text-xs font-medium bg-forest-50 text-forest-700 rounded-lg hover:bg-forest-100 border border-forest-200">
                  + Proposer au parrainage
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'stats' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Revenus mensuels (2025-2026)</h3>
            <div className="space-y-2">
              {['Sep 2025', 'Oct 2025', 'Nov 2025', 'Déc 2025', 'Jan 2026', 'Fév 2026', 'Mar 2026'].map((month, i) => {
                const values = [95, 95, 120, 120, 145, 145, 145];
                const max = 200;
                return (
                  <div key={month} className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-20">{month}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                      <div
                        className="h-5 bg-forest-500 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(values[i] / max) * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">{values[i]}€</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Répartition par espèce</h3>
            <div className="space-y-3">
              {[
                { species: 'Psittacidés (Ara, Amazone)', count: 3, amount: 80, color: 'bg-green-500' },
                { species: 'Amphibiens (Dendrobates)', count: 1, amount: 50, color: 'bg-blue-500' },
                { species: 'Reptiles (Tortues)', count: 1, amount: 15, color: 'bg-amber-500' },
              ].map(item => (
                <div key={item.species}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.species}</span>
                    <span className="text-gray-500">{item.count} parrain{item.count > 1 ? 's' : ''} · {item.amount}€/mois</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${(item.amount / 145) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="text-sm font-medium text-gray-700 mb-3">Prochains renouvellements</div>
              {sponsorships.filter(s => s.status === 'active').slice(0, 3).map(sp => (
                <div key={sp.id} className="flex justify-between text-xs text-gray-600 py-1.5 border-b border-gray-50">
                  <span>{sp.sponsorName}</span>
                  <span className="text-forest-600 font-medium">{new Date(sp.nextPayment).toLocaleDateString('fr-FR')} · {sp.amount}€</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
