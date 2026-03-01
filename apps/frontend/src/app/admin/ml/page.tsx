'use client';
import { useState } from 'react';

const breedingPredictions = [
  { id: 'AM-042', name: 'Ara Macao — Couple A', species: 'Ara macao', probability: 82, expectedDate: '15 Avr 2026', confidence: 'haute', factors: ['Comportement nuptial observé', 'Poids optimal', 'Saison favorable'], status: 'active' },
  { id: 'DA-012', name: 'Dendrobates azureus — Couple B', species: 'Dendrobates azureus', probability: 67, expectedDate: '2 Mai 2026', confidence: 'moyenne', factors: ['Humidité optimale', 'Chants observés'], status: 'active' },
  { id: 'TT-003', name: 'Geochelone carbonaria — Couple C', species: 'Geochelone carbonaria', probability: 45, expectedDate: '10 Juin 2026', confidence: 'faible', factors: ['Température adéquate'], status: 'monitoring' },
  { id: 'AM-031', name: 'Amazona amazonica — Couple D', species: 'Amazona amazonica', probability: 71, expectedDate: '28 Avr 2026', confidence: 'moyenne', factors: ['Nid en construction', 'Alimentation accrue'], status: 'active' },
  { id: 'BC-001', name: 'Boa constrictor — Couple E', species: 'Boa constrictor', probability: 38, expectedDate: '15 Juil 2026', confidence: 'faible', factors: ['Cycle annuel prévu'], status: 'monitoring' },
];

const anomalies = [
  { id: 'ANO-001', animalId: 'BC-001', name: 'Boa constrictor BC-001', type: 'Refus alimentaire', severity: 'critical', detected: 'il y a 2h', description: 'Refus de 3 repas consécutifs. Perte de poids de 8% en 2 semaines.', recommendation: 'Consultation vétérinaire urgente recommandée', status: 'open' },
  { id: 'ANO-002', animalId: 'AM-017', name: 'Ara chloropterus AM-017', type: 'Activité réduite', severity: 'warning', detected: 'il y a 6h', description: 'Activité 40% inférieure à la normale. Plumage ébouriffé observé.', recommendation: 'Surveillance accrue, bilan sanguin conseillé', status: 'monitoring' },
  { id: 'ANO-003', animalId: 'DA-012', name: 'Dendrobates azureus DA-012', type: 'Comportement territorial', severity: 'info', detected: 'il y a 1j', description: 'Comportement territorial inhabituel. Possible stress de groupe.', recommendation: 'Vérifier la densité du groupe, envisager séparation', status: 'resolved' },
  { id: 'ANO-004', animalId: 'TT-003', name: 'Tortue carbonaria TT-003', type: 'Consommation eau anormale', severity: 'warning', detected: 'il y a 4h', description: 'Consommation d\'eau 3x supérieure à la normale.', recommendation: 'Analyse urinaire recommandée', status: 'monitoring' },
];

const nutritionRecs = [
  { animalId: 'AM-042', name: 'Ara Macao AM-042', currentWeight: 1.12, targetWeight: 1.15, recommendations: [
    { food: 'Papaye', qty: '25g', reason: 'Vitamine C — immunité', priority: 'haute' },
    { food: 'Noix du Brésil', qty: '5g', reason: 'Sélénium — antioxydant', priority: 'normale' },
    { food: 'Réduire granulés', qty: '-10g', reason: 'Surpoids léger détecté', priority: 'haute' },
  ]},
  { animalId: 'BC-001', name: 'Boa constrictor BC-001', currentWeight: 4.8, targetWeight: 5.0, recommendations: [
    { food: 'Souris adulte', qty: '2 unités', reason: 'Reprise alimentaire progressive', priority: 'haute' },
    { food: 'Supplément vitamines B', qty: '0.5ml', reason: 'Déficit nutritionnel suspecté', priority: 'haute' },
  ]},
];

export default function MlPage() {
  const [activeTab, setActiveTab] = useState<'predictions' | 'anomalies' | 'nutrition'>('predictions');

  const severityColor = (s: string) => {
    if (s === 'critical') return 'text-red-600 bg-red-50 border-red-200';
    if (s === 'warning') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const severityLabel = (s: string) => {
    if (s === 'critical') return '🔴 Critique';
    if (s === 'warning') return '🟡 Avertissement';
    return '🔵 Information';
  };

  const statusColor = (s: string) => {
    if (s === 'open') return 'bg-red-100 text-red-700';
    if (s === 'monitoring') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const confidenceColor = (c: string) => {
    if (c === 'haute') return 'text-green-600';
    if (c === 'moyenne') return 'text-yellow-600';
    return 'text-red-500';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Intelligence Artificielle & ML</h1>
          <p className="text-gray-500 text-sm mt-1">Prédictions, anomalies comportementales et recommandations nutritionnelles</p>
        </div>
        <span className="flex items-center gap-1.5 text-sm text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
          🧠 Modèles ML actifs · Dernière MAJ il y a 15min
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Prédictions actives', value: breedingPredictions.filter(p => p.status === 'active').length, icon: '🔮', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Anomalies détectées', value: anomalies.filter(a => a.status !== 'resolved').length, icon: '⚠️', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Alertes critiques', value: anomalies.filter(a => a.severity === 'critical').length, icon: '🔴', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Recommandations', value: nutritionRecs.reduce((acc, r) => acc + r.recommendations.length, 0), icon: '🍽️', color: 'text-green-600', bg: 'bg-green-50' },
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
          { key: 'predictions', label: '🔮 Prédictions reproduction' },
          { key: 'anomalies', label: '⚠️ Anomalies comportementales' },
          { key: 'nutrition', label: '🍽️ Recommandations nutritionnelles' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-purple-600 text-purple-700 bg-purple-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-4">
          {breedingPredictions.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <p className="text-sm text-gray-500 italic">{p.species}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${confidenceColor(p.confidence)}`}>Confiance {p.confidence}</span>
                  <p className="text-xs text-gray-400 mt-0.5">Date estimée : {p.expectedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.probability >= 70 ? 'bg-green-500' : p.probability >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                    style={{ width: `${p.probability}%` }}
                  ></div>
                </div>
                <span className="font-bold text-gray-800 text-lg w-12 text-right">{p.probability}%</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.factors.map((f) => (
                  <span key={f} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-100">✓ {f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          {anomalies.map((a) => (
            <div key={a.id} className={`rounded-xl border p-5 ${severityColor(a.severity)}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{a.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${severityColor(a.severity)}`}>{severityLabel(a.severity)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{a.type} · Détecté {a.detected}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(a.status)}`}>
                  {a.status === 'open' ? 'Ouvert' : a.status === 'monitoring' ? 'Surveillance' : 'Résolu'}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{a.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">💡 Recommandation :</span>
                <span className="font-medium text-gray-800">{a.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nutrition Tab */}
      {activeTab === 'nutrition' && (
        <div className="space-y-6">
          {nutritionRecs.map((r) => (
            <div key={r.animalId} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-900">{r.name}</h3>
                <div className="text-right text-sm">
                  <span className="text-gray-500">Poids actuel : </span>
                  <span className="font-bold text-gray-800">{r.currentWeight} kg</span>
                  <span className="text-gray-400 mx-1">→</span>
                  <span className="text-green-600 font-medium">Cible : {r.targetWeight} kg</span>
                </div>
              </div>
              <div className="space-y-3">
                {r.recommendations.map((rec, i) => (
                  <div key={i} className={`flex justify-between items-center p-3 rounded-lg ${rec.priority === 'haute' ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50 border border-gray-100'}`}>
                    <div>
                      <span className="font-medium text-gray-800">{rec.food}</span>
                      <p className="text-xs text-gray-500">{rec.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-700">{rec.qty}</span>
                      <p className={`text-xs ${rec.priority === 'haute' ? 'text-orange-600' : 'text-gray-400'}`}>Priorité {rec.priority}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
