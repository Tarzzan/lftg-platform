'use client';
import { useState } from 'react';

const animals = [
  { id: 'AM-042', name: 'Ara Macao AM-042', species: 'Ara macao', sex: 'M', born: '2019-03-12', origin: 'Élevage LFTG', inbreeding: 0.0125 },
  { id: 'AM-017', name: 'Ara chloropterus AM-017', species: 'Ara chloropterus', sex: 'F', born: '2018-07-22', origin: 'Importation légale', inbreeding: 0.0 },
  { id: 'DA-012', name: 'Dendrobates azureus DA-012', species: 'Dendrobates azureus', sex: 'M', born: '2021-05-10', origin: 'Élevage LFTG', inbreeding: 0.0625 },
  { id: 'TT-003', name: 'Geochelone carbonaria TT-003', species: 'Geochelone carbonaria', sex: 'F', born: '2015-11-04', origin: 'Saisie douanière', inbreeding: 0.0 },
  { id: 'AM-031', name: 'Amazona amazonica AM-031', species: 'Amazona amazonica', sex: 'M', born: '2020-02-18', origin: 'Élevage partenaire', inbreeding: 0.03125 },
];

const genealogyTree = {
  id: 'AM-042',
  name: 'AM-042',
  sex: 'M',
  species: 'Ara macao',
  born: '2019',
  children: [
    {
      id: 'AM-010',
      name: 'AM-010 (Père)',
      sex: 'M',
      species: 'Ara macao',
      born: '2012',
      children: [
        { id: 'AM-001', name: 'AM-001 (GP Paternel)', sex: 'M', species: 'Ara macao', born: '2005', children: [] },
        { id: 'AM-002', name: 'AM-002 (GM Paternelle)', sex: 'F', species: 'Ara macao', born: '2006', children: [] },
      ],
    },
    {
      id: 'AM-011',
      name: 'AM-011 (Mère)',
      sex: 'F',
      species: 'Ara macao',
      born: '2013',
      children: [
        { id: 'AM-003', name: 'AM-003 (GP Maternel)', sex: 'M', species: 'Ara macao', born: '2007', children: [] },
        { id: 'AM-004', name: 'AM-004 (GM Maternelle)', sex: 'F', species: 'Ara macao', born: '2008', children: [] },
      ],
    },
  ],
};

const couplingRecommendations = [
  { male: 'AM-042', female: 'AM-017', score: 94, inbreeding: 0.0, reason: 'Aucun ancêtre commun, diversité génétique maximale', status: 'recommended' },
  { male: 'AM-031', female: 'AM-017', score: 78, inbreeding: 0.0156, reason: 'Légère consanguinité (arrière-grand-parent commun)', status: 'acceptable' },
  { male: 'DA-012', female: 'DA-009', score: 45, inbreeding: 0.125, reason: 'Consanguinité élevée — déconseillé', status: 'not-recommended' },
];

function TreeNode({ node, depth = 0 }: { node: any; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const sexColor = node.sex === 'M' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-pink-100 border-pink-300 text-pink-800';
  const isRoot = depth === 0;

  return (
    <div className={`flex flex-col items-center ${depth > 0 ? 'mt-4' : ''}`}>
      <div
        className={`relative border-2 rounded-xl px-4 py-3 cursor-pointer transition-all hover:shadow-md ${sexColor} ${isRoot ? 'shadow-lg scale-110' : ''}`}
        onClick={() => node.children?.length > 0 && setExpanded(!expanded)}
      >
        <div className="font-bold text-sm">{node.name}</div>
        <div className="text-xs opacity-70">{node.sex === 'M' ? '♂' : '♀'} · {node.born}</div>
        {node.children?.length > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 text-white rounded-full text-xs flex items-center justify-center">
            {expanded ? '−' : '+'}
          </span>
        )}
      </div>
      {expanded && node.children?.length > 0 && (
        <div className="flex gap-8 mt-4 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-300"></div>
          {node.children.map((child: any, i: number) => (
            <div key={child.id} className="relative">
              {i === 0 && <div className="absolute top-0 left-1/2 w-1/2 h-px bg-gray-300"></div>}
              {i === 1 && <div className="absolute top-0 right-1/2 w-1/2 h-px bg-gray-300"></div>}
              <TreeNode node={child} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GenealogyPage() {
  const [activeTab, setActiveTab] = useState<'tree' | 'inbreeding' | 'coupling'>('tree');
  const [selectedAnimal, setSelectedAnimal] = useState('AM-042');

  const selectedAnimalData = animals.find(a => a.id === selectedAnimal);

  const inbreedingColor = (coeff: number) => {
    if (coeff === 0) return 'text-green-600';
    if (coeff < 0.05) return 'text-yellow-600';
    return 'text-red-600';
  };

  const inbreedingLabel = (coeff: number) => {
    if (coeff === 0) return 'Aucune';
    if (coeff < 0.05) return 'Faible';
    if (coeff < 0.125) return 'Modérée';
    return 'Élevée';
  };

  const couplingStatusColor = (s: string) => {
    if (s === 'recommended') return 'bg-green-50 border-green-200';
    if (s === 'acceptable') return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Généalogie Avancée</h1>
          <p className="text-gray-500 text-sm mt-1">Arbre généalogique, calcul de consanguinité et recommandations d'accouplements</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          + Ajouter relation
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { key: 'tree', label: '🌳 Arbre généalogique' },
          { key: 'inbreeding', label: '🧬 Coefficients de consanguinité' },
          { key: 'coupling', label: '💑 Recommandations accouplements' },
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

      {/* Tree Tab */}
      {activeTab === 'tree' && (
        <div>
          <div className="flex gap-2 mb-6 flex-wrap">
            {animals.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAnimal(a.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedAnimal === a.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {a.id}
              </button>
            ))}
          </div>

          {selectedAnimalData && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex justify-between items-center">
              <div>
                <span className="font-semibold text-blue-800">{selectedAnimalData.name}</span>
                <span className="text-blue-600 text-sm ml-2 italic">({selectedAnimalData.species})</span>
              </div>
              <div className="flex gap-4 text-sm text-blue-700">
                <span>Né(e) : {selectedAnimalData.born}</span>
                <span>Origine : {selectedAnimalData.origin}</span>
                <span className={`font-bold ${inbreedingColor(selectedAnimalData.inbreeding)}`}>
                  Consanguinité : {(selectedAnimalData.inbreeding * 100).toFixed(1)}% ({inbreedingLabel(selectedAnimalData.inbreeding)})
                </span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-8 overflow-auto">
            <div className="flex justify-center min-w-max">
              <TreeNode node={genealogyTree} />
            </div>
            <div className="flex gap-4 mt-8 justify-center text-sm">
              <span className="flex items-center gap-2"><span className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></span>Mâle</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 bg-pink-100 border-2 border-pink-300 rounded"></span>Femelle</span>
              <span className="text-gray-400">Cliquer sur un nœud pour développer/réduire</span>
            </div>
          </div>
        </div>
      )}

      {/* Inbreeding Tab */}
      {activeTab === 'inbreeding' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Animal', 'Espèce', 'Sexe', 'Naissance', 'Origine', 'Coefficient', 'Niveau'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {animals.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{a.name}</td>
                  <td className="px-4 py-3 text-gray-500 italic text-xs">{a.species}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.sex === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {a.sex === 'M' ? '♂ Mâle' : '♀ Femelle'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.born}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.origin}</td>
                  <td className={`px-4 py-3 font-bold ${inbreedingColor(a.inbreeding)}`}>
                    {(a.inbreeding * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.inbreeding === 0 ? 'bg-green-100 text-green-700' :
                      a.inbreeding < 0.05 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {inbreedingLabel(a.inbreeding)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Seuils :</strong> 0% = Aucune consanguinité | &lt;5% = Faible (acceptable) | 5–12.5% = Modérée (surveillance) | &gt;12.5% = Élevée (déconseillé)
            </p>
          </div>
        </div>
      )}

      {/* Coupling Tab */}
      {activeTab === 'coupling' && (
        <div className="space-y-4">
          {couplingRecommendations.map((c, i) => (
            <div key={i} className={`rounded-xl border p-5 ${couplingStatusColor(c.status)}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 border-2 border-blue-300 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">{c.male}</div>
                    <span className="text-xs text-gray-500 mt-1">♂ Mâle</span>
                  </div>
                  <span className="text-2xl text-gray-400">×</span>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-pink-100 border-2 border-pink-300 rounded-full flex items-center justify-center text-pink-700 font-bold text-sm">{c.female}</div>
                    <span className="text-xs text-gray-500 mt-1">♀ Femelle</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${c.score >= 80 ? 'text-green-600' : c.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{c.score}/100</div>
                  <div className="text-xs text-gray-500">Score génétique</div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.score >= 80 ? 'bg-green-500' : c.score >= 60 ? 'bg-yellow-500' : 'bg-red-400'}`}
                    style={{ width: `${c.score}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">{c.reason}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Consanguinité prévue :</span>
                  <span className={`text-sm font-bold ${inbreedingColor(c.inbreeding)}`}>{(c.inbreeding * 100).toFixed(2)}%</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.status === 'recommended' ? 'bg-green-100 text-green-700' :
                    c.status === 'acceptable' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {c.status === 'recommended' ? '✓ Recommandé' : c.status === 'acceptable' ? '~ Acceptable' : '✗ Déconseillé'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
