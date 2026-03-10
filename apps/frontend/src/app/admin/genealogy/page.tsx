'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function TreeNode({ node, depth = 0 }: { node: any; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const sexColor = node.sex === 'M' ? 'bg-blue-100 border-blue-300 text-blue-800' : node.sex === 'F' ? 'bg-pink-100 border-pink-300 text-pink-800' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 text-gray-800';
  const isRoot = depth === 0;

  return (
    <div className={`flex flex-col items-center ${depth > 0 ? 'mt-4' : ''}`}>
      <div
        className={`relative border-2 rounded-xl px-4 py-3 cursor-pointer transition-all hover:shadow-md ${sexColor} ${isRoot ? 'shadow-lg scale-110' : ''}`}
        onClick={() => node.children?.length > 0 && setExpanded(!expanded)}
      >
        <div className="font-bold text-sm">{node.name || node.identifier}</div>
        <div className="text-xs opacity-70">
          {node.sex === 'M' ? '♂' : node.sex === 'F' ? '♀' : '?'} · {node.born || '?'}
        </div>
        {node.role && <div className="text-xs font-medium mt-0.5 opacity-80">{node.role}</div>}
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
            <div key={child.id || i} className="relative">
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
  const [activeTab, setActiveTab] = useState<'tree' | 'inbreeding' | 'list'>('list');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  const { data: animals = [], isLoading: loadingAnimals, isError }
  = useQuery({
    queryKey: ['genealogy-animals'],
    queryFn: () => api.get('/genealogy').then(r => r.data),
  });

  const { data: treeData, isLoading: loadingTree } = useQuery({
    queryKey: ['genealogy-tree', selectedAnimalId],
    queryFn: () => api.get(`/genealogy/tree/${selectedAnimalId}`).then(r => r.data),
    enabled: !!selectedAnimalId,
  });

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

  const animalsWithGenealogy = animals.filter((a: any) => a.hasGenealogy);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Généalogie Avancée</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Arbre généalogique, calcul de consanguinité et gestion des relations parentales</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{animals.length} animaux · {animalsWithGenealogy.length} avec généalogie</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-border">
        {[
          { key: 'list', label: '📋 Liste des animaux' },
          { key: 'tree', label: '🌳 Arbre généalogique' },
          { key: 'inbreeding', label: '🧬 Coefficients de consanguinité' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-green-600 text-green-700 bg-green-50'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadingAnimals ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          <span className="ml-3 text-gray-500">Chargement des données généalogiques...</span>
        </div>
      ) : (
        <>
          {activeTab === 'list' && (
            <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-muted/20 border-b border-gray-200 dark:border-border">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Identifiant</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Nom</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Espèce</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Sexe</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Naissance</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Consanguinité</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Généalogie</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {animals.map((animal: any) => (
                    <tr key={animal.id} className="border-b border-gray-100 hover:bg-gray-50 dark:bg-gray-900">
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">{animal.identifier}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{animal.name || animal.identifier}</td>
                      <td className="py-3 px-4 text-gray-600">{animal.species}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${animal.sex === 'M' ? 'text-blue-600' : animal.sex === 'F' ? 'text-pink-600' : 'text-gray-500'}`}>
                          {animal.sex === 'M' ? '♂' : animal.sex === 'F' ? '♀' : '?'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{animal.born || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-semibold ${inbreedingColor(animal.inbreeding)}`}>
                          {(animal.inbreeding * 100).toFixed(1)}% — {inbreedingLabel(animal.inbreeding)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {animal.hasGenealogy ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-medium">Renseignée</span>
                        ) : (
                          <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-0.5 rounded">Non renseignée</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {animal.hasGenealogy && (
                          <button
                            onClick={() => { setSelectedAnimalId(animal.id); setActiveTab('tree'); }}
                            className="text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            Voir l'arbre →
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tree' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Animal :</label>
                <select
                  value={selectedAnimalId || ''}
                  onChange={e => setSelectedAnimalId(e.target.value || null)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="">— Sélectionner un animal —</option>
                  {animalsWithGenealogy.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.identifier} — {a.name || a.species}</option>
                  ))}
                </select>
              </div>

              {!selectedAnimalId ? (
                <div className="bg-gray-50 dark:bg-muted/20 rounded-xl p-12 text-center">
                  <p className="text-4xl mb-3">🌳</p>
                  <p className="text-gray-500">Sélectionnez un animal pour afficher son arbre généalogique</p>
                </div>
              ) : loadingTree ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                </div>
              ) : treeData ? (
                <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-8 overflow-x-auto">
                  <div className="flex justify-center min-w-max">
                    <TreeNode node={treeData} />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-muted/20 rounded-xl p-12 text-center">
                  <p className="text-gray-500">Aucune donnée généalogique disponible pour cet animal.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inbreeding' && (
            <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-muted/20 border-b border-gray-200 dark:border-border">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Animal</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Espèce</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Coefficient F</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Niveau</th>
                  </tr>
                </thead>
                <tbody>
                  {animals
                    .filter((a: any) => a.hasGenealogy)
                    .sort((a: any, b: any) => b.inbreeding - a.inbreeding)
                    .map((animal: any) => (
                      <tr key={animal.id} className="border-b border-gray-100 hover:bg-gray-50 dark:bg-gray-900">
                        <td className="py-3 px-4 font-medium text-gray-900">{animal.name || animal.identifier}</td>
                        <td className="py-3 px-4 text-gray-600">{animal.species}</td>
                        <td className={`py-3 px-4 font-bold ${inbreedingColor(animal.inbreeding)}`}>
                          {(animal.inbreeding * 100).toFixed(2)} %
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            animal.inbreeding === 0 ? 'bg-green-100 text-green-700' :
                            animal.inbreeding < 0.05 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {inbreedingLabel(animal.inbreeding)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {animals.filter((a: any) => a.hasGenealogy).length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Aucune donnée généalogique disponible. Renseignez les relations parentales dans les fiches animaux.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
