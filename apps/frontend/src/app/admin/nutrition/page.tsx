'use client';

import { useState } from 'react';

const dietPlans = [
  {
    id: 'dp-1',
    name: 'Régime Psittacidés',
    species: 'Ara, Amazone, Conure',
    animalsCount: 24,
    mealsPerDay: 2,
    totalCalories: 320,
    components: [
      { food: 'Graines de tournesol', quantity: 50, unit: 'g', frequency: 'quotidien' },
      { food: 'Fruits frais (mangue, goyave)', quantity: 80, unit: 'g', frequency: 'quotidien' },
      { food: 'Légumes verts', quantity: 40, unit: 'g', frequency: 'quotidien' },
      { food: 'Granulés enrichis', quantity: 30, unit: 'g', frequency: 'quotidien' },
      { food: 'Vitamines A+D3', quantity: 2, unit: 'ml', frequency: 'hebdomadaire' },
    ],
    status: 'active',
  },
  {
    id: 'dp-2',
    name: 'Régime Dendrobatidés',
    species: 'Dendrobates azureus, D. tinctorius',
    animalsCount: 48,
    mealsPerDay: 1,
    totalCalories: 15,
    components: [
      { food: 'Drosophiles vivantes', quantity: 20, unit: 'individus', frequency: 'quotidien' },
      { food: 'Grillons micro', quantity: 10, unit: 'individus', frequency: 'tous les 2 jours' },
      { food: 'Poudrage calcium', quantity: 0.1, unit: 'g', frequency: '3x/semaine' },
    ],
    status: 'active',
  },
  {
    id: 'dp-3',
    name: 'Régime Tortues terrestres',
    species: 'Geochelone carbonaria',
    animalsCount: 12,
    mealsPerDay: 1,
    totalCalories: 180,
    components: [
      { food: 'Feuilles de pissenlit', quantity: 100, unit: 'g', frequency: 'quotidien' },
      { food: 'Fleurs hibiscus', quantity: 30, unit: 'g', frequency: 'quotidien' },
      { food: 'Calcium en poudre', quantity: 1, unit: 'g', frequency: '2x/semaine' },
      { food: 'Fruits rouges', quantity: 20, unit: 'g', frequency: '2x/semaine' },
    ],
    status: 'active',
  },
  {
    id: 'dp-4',
    name: 'Régime Serpents',
    species: 'Boa constrictor, Python regius',
    animalsCount: 8,
    mealsPerDay: 0.14,
    totalCalories: 450,
    components: [
      { food: 'Souris adultes congelées', quantity: 2, unit: 'individus', frequency: 'hebdomadaire' },
      { food: 'Rats juvéniles', quantity: 1, unit: 'individu', frequency: 'bi-mensuel' },
    ],
    status: 'active',
  },
];

const todaySchedule = [
  { time: '07:00', species: 'Psittacidés', food: 'Fruits frais + légumes', keeper: 'Marie L.', done: true },
  { time: '08:30', species: 'Dendrobatidés', food: 'Drosophiles vivantes', keeper: 'Pierre M.', done: true },
  { time: '10:00', species: 'Tortues terrestres', food: 'Feuilles + fleurs', keeper: 'Marie L.', done: false },
  { time: '12:00', species: 'Psittacidés', food: 'Granulés + graines', keeper: 'Jean-Paul B.', done: false },
  { time: '15:00', species: 'Serpents (hebdo)', food: 'Souris congelées', keeper: 'Pierre M.', done: false },
  { time: '17:30', species: 'Psittacidés', food: 'Vitamines A+D3', keeper: 'Marie L.', done: false },
];

const stockAlerts = [
  { food: 'Graines de tournesol', current: 2, min: 5, unit: 'kg', status: 'critical' },
  { food: 'Vitamines A+D3', current: 3, min: 5, unit: 'flacons', status: 'warning' },
  { food: 'Drosophiles (culture)', current: 8, min: 10, unit: 'boîtes', status: 'warning' },
];

export default function NutritionPage() {
  const [tab, setTab] = useState<'plans' | 'schedule' | 'stock'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [schedule, setSchedule] = useState(todaySchedule);

  const plan = dietPlans.find(p => p.id === selectedPlan);

  const toggleDone = (idx: number) => {
    setSchedule(prev => prev.map((s, i) => i === idx ? { ...s, done: !s.done } : s));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Nutrition</h1>
          <p className="text-sm text-gray-500 mt-1">Plans alimentaires et calendrier d'alimentation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 text-sm font-medium">
          + Nouveau plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Plans actifs', value: dietPlans.length, icon: '📋', color: 'text-forest-700' },
          { label: 'Animaux suivis', value: dietPlans.reduce((s, p) => s + p.animalsCount, 0), icon: '🐾', color: 'text-blue-700' },
          { label: 'Repas aujourd\'hui', value: todaySchedule.length, icon: '🍽️', color: 'text-amber-700' },
          { label: 'Alertes stock', value: stockAlerts.length, icon: '⚠️', color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['plans', 'schedule', 'stock'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'plans' ? '📋 Plans alimentaires' : t === 'schedule' ? '📅 Calendrier du jour' : '📦 Stock alimentaire'}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <div className="grid md:grid-cols-2 gap-4">
          {dietPlans.map(p => (
            <div
              key={p.id}
              className={`bg-white rounded-xl border cursor-pointer transition-all ${
                selectedPlan === p.id ? 'border-forest-400 ring-2 ring-forest-100' : 'border-gray-100 hover:border-forest-200'
              }`}
              onClick={() => setSelectedPlan(selectedPlan === p.id ? null : p.id)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{p.species}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">● Actif</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-gray-900">{p.animalsCount}</div>
                    <div className="text-xs text-gray-500">animaux</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-gray-900">{p.mealsPerDay < 1 ? '1/sem' : p.mealsPerDay + 'x'}</div>
                    <div className="text-xs text-gray-500">repas/jour</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-gray-900">{p.totalCalories}</div>
                    <div className="text-xs text-gray-500">kcal/j</div>
                  </div>
                </div>

                {selectedPlan === p.id && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Composition du régime</h4>
                    <div className="space-y-2">
                      {p.components.map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">🌿 {c.food}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{c.quantity} {c.unit}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{c.frequency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'schedule' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Calendrier du jour — 1 Mars 2026</h3>
            <div className="text-sm text-gray-500">
              {schedule.filter(s => s.done).length}/{schedule.length} repas effectués
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {schedule.map((s, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-4 ${s.done ? 'opacity-60' : ''}`}>
                <div className="text-sm font-mono font-bold text-gray-700 w-14">{s.time}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{s.species}</div>
                  <div className="text-xs text-gray-500">{s.food}</div>
                </div>
                <div className="text-xs text-gray-500">👤 {s.keeper}</div>
                <button
                  onClick={() => toggleDone(i)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                    s.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-forest-400'
                  }`}
                >
                  {s.done && '✓'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold text-amber-800 mb-3">⚠️ Alertes de stock alimentaire</h3>
            <div className="space-y-3">
              {stockAlerts.map((a, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{a.food}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Stock actuel : <strong>{a.current} {a.unit}</strong> / Minimum : {a.min} {a.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${a.status === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, (a.current / a.min) * 100)}%` }}
                      />
                    </div>
                    <button className="text-xs px-3 py-1.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700">
                      Commander
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Inventaire alimentaire complet</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { food: 'Graines de tournesol', current: 2, max: 20, unit: 'kg' },
                { food: 'Fruits frais (mangue)', current: 15, max: 20, unit: 'kg' },
                { food: 'Légumes verts', current: 8, max: 15, unit: 'kg' },
                { food: 'Granulés enrichis', current: 12, max: 25, unit: 'kg' },
                { food: 'Vitamines A+D3', current: 3, max: 10, unit: 'flacons' },
                { food: 'Drosophiles (culture)', current: 8, max: 20, unit: 'boîtes' },
                { food: 'Grillons micro', current: 15, max: 20, unit: 'boîtes' },
                { food: 'Calcium poudre', current: 6, max: 10, unit: 'kg' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{item.food}</span>
                      <span className="text-gray-500">{item.current}/{item.max} {item.unit}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          item.current / item.max < 0.3 ? 'bg-red-500' :
                          item.current / item.max < 0.5 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(item.current / item.max) * 100}%` }}
                      />
                    </div>
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
