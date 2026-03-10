'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface NutritionPlan {
  id: string;
  name: string;
  description?: string;
  species: { id: string; name: string; scientificName?: string };
  meals: Array<{
    id: string;
    name: string;
    time: string;
    items: Array<{ stockItemId?: string; food?: string; quantity: number; unit: string; calories?: number }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleItem {
  planId: string;
  planName: string;
  speciesName: string;
  mealName: string;
  time: string;
  items: Array<{ food?: string; quantity: number; unit: string; calories?: number }>;
  done: boolean;
}

interface NutritionStats {
  totalPlans: number;
  speciesCovered: number;
  feedingsToday: number;
  feedingsDone: number;
  avgConsumptionRate: number;
  alertsNutrition: number;
  lastUpdate: string;
}

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'schedule' | 'stats'>('schedule');
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);

  const { data: plans = [], isLoading: plansLoading , isError } = useQuery<NutritionPlan[]>({
    queryKey: ['nutrition-plans'],
    queryFn: () => api.get('/nutrition/plans').then(r => r.data),
  });

  const { data: schedule = [], isLoading: scheduleLoading } = useQuery<ScheduleItem[]>({
    queryKey: ['nutrition-schedule-today'],
    queryFn: () => api.get('/nutrition/schedule/today').then(r => r.data),
  });

  const { data: stats } = useQuery<NutritionStats>({
    queryKey: ['nutrition-stats'],
    queryFn: () => api.get('/nutrition/stats').then(r => r.data),
  });

  const isLoading = plansLoading || scheduleLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🌿 Nutrition & Alimentation</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Plans nutritionnels et suivi des repas</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-4">
            <div className="text-2xl font-bold text-forest-700">{stats.totalPlans}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Plans nutritionnels</div>
          </div>
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-4">
            <div className="text-2xl font-bold text-blue-700">{stats.speciesCovered}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Espèces couvertes</div>
          </div>
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-4">
            <div className="text-2xl font-bold text-amber-700">{stats.feedingsDone}/{stats.feedingsToday}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Repas du jour</div>
          </div>
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-4">
            <div className={`text-2xl font-bold ${stats.avgConsumptionRate >= 80 ? 'text-green-700' : 'text-red-700'}`}>
              {stats.avgConsumptionRate}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Taux de consommation</div>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="flex border-b border-gray-200 dark:border-border">
        {[
          { key: 'schedule', label: '📋 Planning du jour' },
          { key: 'plans', label: '📖 Plans nutritionnels' },
          { key: 'stats', label: '📊 Statistiques' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-forest-600 text-forest-700'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Planning du jour */}
      {!isLoading && activeTab === 'schedule' && (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Planning des repas — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          </div>
          {schedule.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🌿</div>
              <p>Aucun plan nutritionnel configuré</p>
              <p className="text-sm mt-1">Créez des plans nutritionnels pour les espèces de votre collection</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {schedule.map((item, index) => (
                <div key={index} className={`flex items-start gap-4 p-4 transition-colors ${item.done ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-sm font-bold text-gray-900">{item.time}</div>
                    <div className={`text-xs mt-1 ${item.done ? 'text-green-600' : 'text-gray-400'}`}>
                      {item.done ? '✓ Fait' : 'À faire'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">{item.mealName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">🦎 {item.speciesName}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.items.map((food, fi) => (
                        <span key={fi} className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                          {food.food || `Aliment ${fi + 1}`} — {food.quantity} {food.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!item.done && (
                    <button className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors">
                      Valider
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plans nutritionnels */}
      {!isLoading && activeTab === 'plans' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-400 bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border">
              <div className="text-4xl mb-3">📖</div>
              <p>Aucun plan nutritionnel créé</p>
            </div>
          ) : (
            plans.map(plan => (
              <div
                key={plan.id}
                className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden cursor-pointer hover:border-forest-300 transition-colors"
                onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        🦎 {plan.species.name}
                        {plan.species.scientificName && (
                          <span className="italic ml-1">({plan.species.scientificName})</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                      Actif
                    </span>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm text-gray-600">
                    <span>🍽️ {plan.meals.length} repas/jour</span>
                  </div>
                  {plan.description && (
                    <p className="mt-2 text-xs text-gray-500">{plan.description}</p>
                  )}
                </div>

                {selectedPlan?.id === plan.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Détail des repas</h4>
                    <div className="space-y-3">
                      {plan.meals.map(meal => (
                        <div key={meal.id} className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-gray-900 dark:text-foreground bg-gray-100 px-2 py-0.5 rounded">{meal.time}</span>
                            <span className="text-sm font-medium text-gray-800">{meal.name}</span>
                          </div>
                          <div className="space-y-1">
                            {(meal.items as any[]).map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                                <span>{item.food || item.name || `Aliment ${i + 1}`}</span>
                                <span className="font-medium">{item.quantity} {item.unit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Statistiques */}
      {!isLoading && activeTab === 'stats' && stats && (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-foreground mb-6">Statistiques nutritionnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Repas du jour</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Repas planifiés</span>
                  <span className="font-medium">{stats.feedingsToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Repas effectués</span>
                  <span className="font-medium text-green-600">{stats.feedingsDone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Restants</span>
                  <span className="font-medium text-amber-600">{stats.feedingsToday - stats.feedingsDone}</span>
                </div>
              </div>
              {stats.feedingsToday > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progression</span>
                    <span>{Math.round((stats.feedingsDone / stats.feedingsToday) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-forest-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.round((stats.feedingsDone / stats.feedingsToday) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Plans nutritionnels</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plans actifs</span>
                  <span className="font-medium">{stats.totalPlans}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Espèces couvertes</span>
                  <span className="font-medium">{stats.speciesCovered}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Alertes nutrition</span>
                  <span className={`font-medium ${stats.alertsNutrition > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.alertsNutrition > 0 ? `${stats.alertsNutrition} alerte(s)` : 'Aucune alerte'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Dernière mise à jour : {new Date(stats.lastUpdate).toLocaleString('fr-FR')}
          </p>
        </div>
      )}
    </div>
  );
}
