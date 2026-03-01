'use client';

import { useState } from 'react';

const BREEDING_PAIRS = [
  {
    id: 'pair-1',
    male: 'Zeus (M-00)',
    female: 'Amazona (F-01)',
    species: 'Amazona amazonica',
    compatibility: 'EXCELLENT',
    consanguinity: 0.0,
    lastBrood: '2023-05-22',
    totalOffspring: 3,
    status: 'ACTIVE',
    notes: 'Couple stable depuis 2019, excellente productivité',
  },
  {
    id: 'pair-2',
    male: 'Dendrobate M (D-01)',
    female: 'Dendrobate F (D-02)',
    species: 'Dendrobates tinctorius',
    compatibility: 'GOOD',
    consanguinity: 0.125,
    lastBrood: '2024-01-15',
    totalOffspring: 8,
    status: 'ACTIVE',
    notes: 'Surveiller le coefficient de consanguinité',
  },
  {
    id: 'pair-3',
    male: 'Boa M (B-01)',
    female: 'Boa F (B-02)',
    species: 'Boa constrictor',
    compatibility: 'GOOD',
    consanguinity: 0.0,
    lastBrood: null,
    totalOffspring: 0,
    status: 'PLANNED',
    notes: 'Première mise en reproduction prévue pour 2026',
  },
  {
    id: 'pair-4',
    male: 'Ara M (A-01)',
    female: 'Ara F (A-02)',
    species: 'Ara chloropterus',
    compatibility: 'EXCELLENT',
    consanguinity: 0.0,
    lastBrood: '2024-03-10',
    totalOffspring: 5,
    status: 'ACTIVE',
    notes: 'Meilleur taux d\'éclosion de la ferme (88.9%)',
  },
];

const SPECIES_STATS = [
  { species: 'Amazona amazonica', count: 45, pairs: 4, avgConsanguinity: 0.028, diversity: 'HIGH' },
  { species: 'Ara chloropterus', count: 32, pairs: 3, avgConsanguinity: 0.041, diversity: 'MEDIUM' },
  { species: 'Dendrobates tinctorius', count: 28, pairs: 5, avgConsanguinity: 0.067, diversity: 'MEDIUM' },
  { species: 'Boa constrictor', count: 18, pairs: 2, avgConsanguinity: 0.012, diversity: 'HIGH' },
  { species: 'Iguana iguana', count: 22, pairs: 3, avgConsanguinity: 0.019, diversity: 'HIGH' },
];

const COMPATIBILITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  EXCELLENT: { label: 'Excellent', color: 'text-green-700', bg: 'bg-green-100' },
  GOOD: { label: 'Bon', color: 'text-blue-700', bg: 'bg-blue-100' },
  ACCEPTABLE: { label: 'Acceptable', color: 'text-amber-700', bg: 'bg-amber-100' },
  POOR: { label: 'Mauvais', color: 'text-red-700', bg: 'bg-red-100' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Actif', color: 'text-green-700', bg: 'bg-green-100' },
  PLANNED: { label: 'Planifié', color: 'text-blue-700', bg: 'bg-blue-100' },
  PAUSED: { label: 'En pause', color: 'text-amber-700', bg: 'bg-amber-100' },
  ENDED: { label: 'Terminé', color: 'text-gray-600', bg: 'bg-gray-100' },
};

// Simple genealogy tree component
function GenealogyNode({ node, depth = 0 }: { node: any; depth?: number }) {
  if (!node) return null;
  const isExternal = node.status === 'EXTERNAL';
  return (
    <div className={`flex flex-col items-center ${depth > 0 ? 'mt-2' : ''}`}>
      <div className={`px-3 py-2 rounded-xl text-xs font-medium text-center min-w-[120px] border-2 ${
        isExternal ? 'bg-gray-50 border-gray-200 text-gray-500' :
        node.gender === 'MALE' ? 'bg-maroni-50 border-maroni-300 text-maroni-800' :
        'bg-laterite-50 border-laterite-300 text-laterite-800'
      }`}>
        <div className="font-bold">{node.name}</div>
        <div className="text-xs opacity-70">{node.species?.split(' ')[0]}</div>
        {node.birthDate && <div className="text-xs opacity-60">né {node.birthDate.slice(0, 4)}</div>}
        {isExternal && <div className="text-xs text-gray-400">Externe</div>}
      </div>
      {node.parents && (
        <div className="flex gap-8 mt-3 relative">
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-wood-300" />
          <div className="flex flex-col items-center">
            <div className="w-px h-3 bg-wood-300" />
            <GenealogyNode node={node.parents.father} depth={depth + 1} />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-px h-3 bg-wood-300" />
            <GenealogyNode node={node.parents.mother} depth={depth + 1} />
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_GENEALOGY = {
  id: 'animal-1',
  name: 'Amazona (F-01)',
  species: 'Amazona amazonica',
  gender: 'FEMALE',
  birthDate: '2019-03-15',
  status: 'ALIVE',
  parents: {
    father: {
      id: 'animal-p1',
      name: 'Zeus (M-00)',
      species: 'Amazona amazonica',
      gender: 'MALE',
      birthDate: '2015-06-20',
      status: 'ALIVE',
      parents: {
        father: { id: 'gp1', name: 'Atlas (M-ext)', species: 'Amazona amazonica', gender: 'MALE', birthDate: '2010-01-01', status: 'EXTERNAL', parents: null },
        mother: { id: 'gp2', name: 'Hera (F-ext)', species: 'Amazona amazonica', gender: 'FEMALE', birthDate: '2011-03-15', status: 'EXTERNAL', parents: null },
      },
    },
    mother: {
      id: 'animal-p2',
      name: 'Luna (F-00)',
      species: 'Amazona amazonica',
      gender: 'FEMALE',
      birthDate: '2016-09-10',
      status: 'ALIVE',
      parents: {
        father: { id: 'gp3', name: 'Orion (M-ext)', species: 'Amazona amazonica', gender: 'MALE', birthDate: '2012-05-20', status: 'EXTERNAL', parents: null },
        mother: { id: 'gp4', name: 'Selene (F-ext)', species: 'Amazona amazonica', gender: 'FEMALE', birthDate: '2013-07-08', status: 'EXTERNAL', parents: null },
      },
    },
  },
  offspring: [
    { id: 'o1', name: 'Petit-1 (M-02)', gender: 'MALE', birthDate: '2022-04-10', status: 'ALIVE' },
    { id: 'o2', name: 'Petit-2 (F-02)', gender: 'FEMALE', birthDate: '2022-04-10', status: 'ALIVE' },
    { id: 'o3', name: 'Petit-3 (M-03)', gender: 'MALE', birthDate: '2023-05-22', status: 'ALIVE' },
  ],
};

export default function ElevagePage() {
  const [activeTab, setActiveTab] = useState('pairs');
  const [selectedAnimal, setSelectedAnimal] = useState('animal-1');

  const tabs = [
    { id: 'pairs', label: '💑 Couples reproducteurs' },
    { id: 'genealogy', label: '🌳 Généalogie' },
    { id: 'genetics', label: '🧬 Génétique' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wood-900">Élevage & Généalogie</h1>
          <p className="text-sm text-wood-500 mt-1">Gestion des couples reproducteurs et arbres généalogiques</p>
        </div>
        <button className="btn-primary text-sm px-4 py-2">+ Nouveau couple</button>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Couples actifs', value: '12', icon: '💑', color: 'text-forest-700' },
          { label: 'Reproductions en cours', value: '5', icon: '🥚', color: 'text-amber-700' },
          { label: 'Consanguinité moy.', value: '3.2%', icon: '🧬', color: 'text-maroni-700' },
          { label: 'Couples à risque', value: '2', icon: '⚠️', color: 'text-red-700' },
        ].map((stat, i) => (
          <div key={i} className="card p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-wood-500">{stat.label}</p>
          </div>
        ))}
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

      {activeTab === 'pairs' && (
        <div className="space-y-4">
          {BREEDING_PAIRS.map(pair => {
            const compat = COMPATIBILITY_CONFIG[pair.compatibility];
            const status = STATUS_CONFIG[pair.status];
            const consanguinityRisk = pair.consanguinity > 0.1 ? 'HIGH' : pair.consanguinity > 0.05 ? 'MEDIUM' : 'LOW';
            return (
              <div key={pair.id} className={`card p-5 ${consanguinityRisk === 'HIGH' ? 'border-l-4 border-l-amber-500' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-wood-900 text-lg">
                        <span className="text-maroni-700">{pair.male}</span>
                        <span className="text-wood-400 mx-2">×</span>
                        <span className="text-laterite-700">{pair.female}</span>
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${compat.bg} ${compat.color}`}>
                        {compat.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-wood-500 italic mb-3">{pair.species}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-wood-400 text-xs">Consanguinité</span>
                        <p className={`font-semibold ${consanguinityRisk === 'HIGH' ? 'text-red-600' : consanguinityRisk === 'MEDIUM' ? 'text-amber-600' : 'text-green-600'}`}>
                          {(pair.consanguinity * 100).toFixed(1)}%
                          {consanguinityRisk === 'HIGH' && ' ⚠️'}
                        </p>
                      </div>
                      <div>
                        <span className="text-wood-400 text-xs">Dernière couvée</span>
                        <p className="font-semibold text-wood-800">{pair.lastBrood || 'Aucune'}</p>
                      </div>
                      <div>
                        <span className="text-wood-400 text-xs">Total descendants</span>
                        <p className="font-semibold text-wood-800">{pair.totalOffspring}</p>
                      </div>
                    </div>
                    {pair.notes && (
                      <p className="text-xs text-wood-500 mt-2 italic">💬 {pair.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="text-sm px-3 py-1.5 border border-wood-200 rounded-lg text-wood-600 hover:bg-wood-50">Détail</button>
                    <button className="text-sm px-3 py-1.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700">Couvée</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'genealogy' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-wood-700">Animal :</label>
              <select
                value={selectedAnimal}
                onChange={e => setSelectedAnimal(e.target.value)}
                className="px-3 py-1.5 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="animal-1">Amazona (F-01)</option>
                <option value="animal-2">Zeus (M-00)</option>
                <option value="animal-3">Ara Bleu (E-03)</option>
              </select>
              <div className="flex items-center gap-4 ml-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border-2 border-maroni-300 bg-maroni-50" /><span className="text-wood-500">Mâle</span></div>
                <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border-2 border-laterite-300 bg-laterite-50" /><span className="text-wood-500">Femelle</span></div>
                <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border-2 border-gray-200 bg-gray-50" /><span className="text-wood-500">Externe</span></div>
              </div>
            </div>

            {/* Genealogy tree */}
            <div className="overflow-x-auto">
              <div className="min-w-[600px] p-4">
                <h3 className="text-sm font-semibold text-wood-600 mb-4 text-center">Arbre généalogique — {MOCK_GENEALOGY.name}</h3>

                {/* Ancestors */}
                <div className="mb-6">
                  <p className="text-xs text-wood-400 text-center mb-3">Ascendants (3 générations)</p>
                  <div className="flex justify-center">
                    <GenealogyNode node={MOCK_GENEALOGY} />
                  </div>
                </div>

                {/* Offspring */}
                <div className="border-t border-wood-200 pt-4">
                  <p className="text-xs text-wood-400 text-center mb-3">Descendants ({MOCK_GENEALOGY.offspring.length})</p>
                  <div className="flex justify-center gap-6">
                    {MOCK_GENEALOGY.offspring.map(child => (
                      <div key={child.id} className={`px-3 py-2 rounded-xl text-xs font-medium text-center min-w-[100px] border-2 ${
                        child.gender === 'MALE' ? 'bg-maroni-50 border-maroni-300 text-maroni-800' : 'bg-laterite-50 border-laterite-300 text-laterite-800'
                      }`}>
                        <div className="font-bold">{child.name}</div>
                        <div className="text-xs opacity-70">né {child.birthDate.slice(0, 4)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Genetic info */}
            <div className="mt-4 p-3 bg-forest-50 rounded-xl border border-forest-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-wood-500">Coefficient de consanguinité</p>
                  <p className="font-bold text-green-700 text-lg">0.0%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-wood-500">Diversité génétique</p>
                  <p className="font-bold text-forest-700 text-lg">ÉLEVÉE</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-wood-500">Générations tracées</p>
                  <p className="font-bold text-wood-800 text-lg">3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'genetics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPECIES_STATS.map((sp, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-wood-900">{sp.species}</h3>
                    <p className="text-xs text-wood-500">{sp.count} individus · {sp.pairs} couples</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    sp.diversity === 'HIGH' ? 'bg-green-100 text-green-700' :
                    sp.diversity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Diversité {sp.diversity === 'HIGH' ? 'élevée' : sp.diversity === 'MEDIUM' ? 'moyenne' : 'faible'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-wood-500 mb-1">
                      <span>Consanguinité moyenne</span>
                      <span className={sp.avgConsanguinity > 0.05 ? 'text-amber-600 font-semibold' : 'text-green-600 font-semibold'}>
                        {(sp.avgConsanguinity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-wood-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sp.avgConsanguinity > 0.05 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(sp.avgConsanguinity * 500, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-wood-100">
                  <p className="text-xs text-wood-500">
                    {sp.avgConsanguinity > 0.05
                      ? '⚠️ Recommandation : introduire des individus externes pour augmenter la diversité génétique'
                      : '✅ Diversité génétique satisfaisante — continuer le suivi régulier'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pairing suggestions */}
          <div className="card p-6">
            <h2 className="font-semibold text-wood-800 mb-4">🔬 Suggestions d'appariement — Amazona (F-01)</h2>
            <div className="space-y-3">
              {[
                { partner: 'Amazona (F-ext-01)', source: 'Éleveur partenaire — Cayenne', consanguinity: 0.0, score: 98, recommendation: 'STRONGLY_RECOMMENDED' },
                { partner: 'Luna-2 (F-00b)', source: 'LFTG interne', consanguinity: 0.125, score: 72, recommendation: 'ACCEPTABLE' },
              ].map((s, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${s.recommendation === 'STRONGLY_RECOMMENDED' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div>
                    <p className="font-semibold text-wood-900">{s.partner}</p>
                    <p className="text-xs text-wood-500">{s.source}</p>
                    <p className="text-xs mt-1">Consanguinité : <span className={s.consanguinity > 0.1 ? 'text-amber-600 font-semibold' : 'text-green-600 font-semibold'}>{(s.consanguinity * 100).toFixed(1)}%</span></p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${s.score >= 90 ? 'text-green-700' : 'text-amber-700'}`}>{s.score}/100</div>
                    <p className="text-xs text-wood-500">{s.recommendation === 'STRONGLY_RECOMMENDED' ? '✅ Fortement recommandé' : '⚠️ Acceptable'}</p>
                    <button className="mt-2 text-xs px-3 py-1 bg-forest-600 text-white rounded-lg hover:bg-forest-700">Créer couple</button>
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
