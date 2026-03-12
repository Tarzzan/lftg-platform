'use client';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface ReportType {
  type: string;
  label: string;
  description?: string;
  icon?: string;
}

interface GenerateParams {
  type: string;
  year?: number;
  month?: number;
  animalId?: string;
  startDate?: string;
  endDate?: string;
}

export default function ReportsPage() {
  const currentDate = new Date();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [params, setParams] = useState<GenerateParams>({
    type: '',
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: reportTypes = [], isLoading } = useQuery<ReportType[]>({
    queryKey: ['reports-types'],
    queryFn: async () => {
      const res = await api.get('/reports');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (p: GenerateParams) => {
      const endpoint = p.type === 'monthly_summary'
        ? `/reports/monthly?year=${p.year}&month=${p.month}`
        : p.type === 'stock_inventory'
        ? `/reports/stock`
        : p.type === 'animal_medical'
        ? `/reports/animal/${p.animalId || 'all'}`
        : `/reports/${p.type}`;
      const res = await api.get(endpoint, { responseType: 'blob' });
      return res.data;
    },
    onSuccess: (blob) => {
      toast.success('Opération réussie avec succès');
      const url = URL.createObjectURL(blob);
      setGeneratedUrl(url);
      setError(null);
      // Téléchargement automatique
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${params.type}-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
    },
    onError: (err: any) => {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      setError(err?.response?.data?.message || 'Erreur lors de la génération du rapport');
      setGeneratedUrl(null);
    },
  });

  const handleGenerate = () => {
    if (!selectedType) return;
    setError(null);
    generateMutation.mutate({ ...params, type: selectedType });
  };

  const reportIcons: Record<string, string> = {
    monthly_summary: '',
    animal_medical: '',
    stock_inventory: '',
    cites_compliance: '',
    financial: '',
    genealogy: '',
  };

  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Rapports & Exports</h1>
        <p className="text-slate-400 mt-1">Génération de rapports PDF et exports de données</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sélection du type de rapport */}
          <div className="space-y-3">
            <h2 className="text-white font-semibold">Choisir un rapport</h2>
            {reportTypes.length === 0 ? (
              <p className="text-slate-400">Aucun type de rapport disponible</p>
            ) : (
              reportTypes.map((rt) => (
                <button
                  key={rt.type}
                  onClick={() => {
                    setSelectedType(rt.type);
                    setParams((p) => ({ ...p, type: rt.type }));
                    setGeneratedUrl(null);
                    setError(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedType === rt.type ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{rt.icon || reportIcons[rt.type] || ''}</span>
                    <div>
                      <p className="text-white font-semibold">{rt.label}</p>
                      {rt.description && <p className="text-slate-400 text-sm">{rt.description}</p>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Paramètres et génération */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-fit">
            <h2 className="text-white font-semibold mb-4">Paramètres</h2>

            {!selectedType ? (
              <p className="text-slate-400 text-center py-8">Sélectionnez un type de rapport</p>
            ) : (
              <div className="space-y-4">
                {/* Paramètres spécifiques selon le type */}
                {selectedType === 'monthly_summary' && (
                  <>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Mois</label>
                      <select
                        value={params.month}
                        onChange={(e) => setParams({ ...params, month: parseInt(e.target.value) })}
                        className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
                      >
                        {months.map((m, i) => (
                          <option key={i} value={i + 1}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Année</label>
                      <input
                        type="number"
                        value={params.year}
                        onChange={(e) => setParams({ ...params, year: parseInt(e.target.value) })}
                        className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}

                {selectedType === 'animal_medical' && (
                  <div>
                    <label className="text-slate-400 text-sm block mb-1">ID de l'animal (optionnel)</label>
                    <input
                      type="text"placeholder="Laisser vide pour tous les animaux"value={params.animalId ||''}
                      onChange={(e) => setParams({ ...params, animalId: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* Erreur */}
                {error && (
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Succès */}
                {generatedUrl && (
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                    <p className="text-green-400 text-sm">Rapport généré et téléchargé</p>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Génération en cours...
                    </>
                  ) : (
                    <>Générer le rapport PDF</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
