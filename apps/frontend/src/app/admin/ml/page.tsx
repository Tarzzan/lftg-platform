'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface BreedingPrediction {
  animalId: string;
  species: string;
  probability: number;
  expectedDate?: string;
  notes?: string;
}

interface BehavioralAnomaly {
  animalId: string;
  species?: string;
  anomalyType: string;
  severity: string;
  detectedAt: string;
  description?: string;
}

interface NutritionRecommendation {
  animalId: string;
  species?: string;
  currentDiet?: string;
  recommendedDiet?: string;
  reason?: string;
  priority?: string;
}

export default function MLPage() {
  const { data: breedingPredictions = [], isLoading: loadingBreeding, isError }
  = useQuery<BreedingPrediction[]>({
    queryKey: ['ml-breeding'],
    queryFn: async () => {
      const res = await api.get('/ml/breeding-predictions');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: anomalies = [], isLoading: loadingAnomalies } = useQuery<BehavioralAnomaly[]>({
    queryKey: ['ml-anomalies'],
    queryFn: async () => {
      const res = await api.get('/ml/behavioral-anomalies');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: nutritionRecs = [], isLoading: loadingNutrition } = useQuery<NutritionRecommendation[]>({
    queryKey: ['ml-nutrition'],
    queryFn: async () => {
      const res = await api.get('/ml/nutrition-recommendations');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const isLoading = loadingBreeding || loadingAnomalies || loadingNutrition;

  const severityConfig: Record<string, { color: string; bg: string }> = {
    HIGH: { color: 'text-red-400', bg: 'bg-red-900/30' },
    MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
    LOW: { color: 'text-green-400', bg: 'bg-green-900/30' },
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Intelligence Artificielle & ML</h1>
        <p className="text-slate-400 mt-1">Prédictions et recommandations basées sur les données de la ferme</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prédictions de reproduction */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">Prédictions de reproduction<span className="bg-indigo-900/50 text-indigo-300 text-xs px-2 py-0.5 rounded">{breedingPredictions.length}</span>
            </h2>
            {breedingPredictions.length === 0 ? (
              <p className="text-slate-400 text-sm">Aucune prédiction disponible</p>
            ) : (
              <div className="space-y-3">
                {breedingPredictions.map((pred, i) => (
                  <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm">{pred.species}</span>
                      <span className={`text-xs font-bold ${pred.probability > 0.7 ? 'text-green-400' : pred.probability > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {Math.round(pred.probability * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1.5 mb-1">
                      <div
                        className={`h-1.5 rounded-full ${pred.probability > 0.7 ? 'bg-green-500' : pred.probability > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${pred.probability * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>ID: {pred.animalId}</span>
                      {pred.expectedDate && <span>Prévu : {new Date(pred.expectedDate).toLocaleDateString('fr-FR')}</span>}
                    </div>
                    {pred.notes && <p className="text-slate-400 text-xs mt-1 italic">{pred.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anomalies comportementales */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">️ Anomalies comportementales<span className={`text-xs px-2 py-0.5 rounded ${anomalies.length > 0 ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
                {anomalies.length}
              </span>
            </h2>
            {anomalies.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-2"></p>
                <p className="text-green-400 text-sm">Aucune anomalie détectée</p>
              </div>
            ) : (
              <div className="space-y-3">
                {anomalies.map((anomaly, i) => {
                  const sCfg = severityConfig[anomaly.severity?.toUpperCase()] || severityConfig.LOW;
                  return (
                    <div key={i} className={`rounded-lg p-3 border ${sCfg.bg} border-slate-600`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{anomaly.anomalyType}</span>
                        <span className={`text-xs font-bold ${sCfg.color}`}>{anomaly.severity}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>ID: {anomaly.animalId} {anomaly.species ? `— ${anomaly.species}` : ''}</span>
                        <span>{new Date(anomaly.detectedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {anomaly.description && <p className="text-slate-300 text-xs mt-1">{anomaly.description}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommandations nutritionnelles */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 lg:col-span-2">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">Recommandations nutritionnelles<span className="bg-cyan-900/50 text-cyan-300 text-xs px-2 py-0.5 rounded">{nutritionRecs.length}</span>
            </h2>
            {nutritionRecs.length === 0 ? (
              <p className="text-slate-400 text-sm">Aucune recommandation disponible</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nutritionRecs.map((rec, i) => (
                  <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{rec.species || rec.animalId}</span>
                      {rec.priority && (
                        <span className={`text-xs font-bold ${rec.priority === 'HIGH' ? 'text-red-400' : rec.priority === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {rec.priority}
                        </span>
                      )}
                    </div>
                    {rec.currentDiet && (
                      <p className="text-slate-400 text-xs">Actuel : <span className="text-slate-300">{rec.currentDiet}</span></p>
                    )}
                    {rec.recommendedDiet && (
                      <p className="text-cyan-400 text-xs mt-1">→ Recommandé : {rec.recommendedDiet}</p>
                    )}
                    {rec.reason && <p className="text-slate-400 text-xs mt-1 italic">{rec.reason}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
