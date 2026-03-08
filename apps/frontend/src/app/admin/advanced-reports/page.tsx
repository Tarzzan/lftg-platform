'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

export default function AdvancedReportsPage() {
  const [downloadingCites, setDownloadingCites] = useState(false);
  const [downloadingAnnual, setDownloadingAnnual] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const downloadCitesReport = async () => {
    setDownloadingCites(true);
    try {
      const res = await api.get('/advanced-reports/cites', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-cites-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erreur téléchargement rapport CITES', e);
    } finally {
      setDownloadingCites(false);
    }
  };

  const downloadAnnualReport = async () => {
    setDownloadingAnnual(true);
    try {
      const res = await api.get(`/advanced-reports/annual?year=${selectedYear}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-annuel-${selectedYear}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erreur téléchargement rapport annuel', e);
    } finally {
      setDownloadingAnnual(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Rapports Avancés</h1>
        <p className="text-slate-400 mt-1">Génération de rapports PDF officiels pour les autorités et la direction</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rapport CITES */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🌿</span>
            <div>
              <h2 className="text-white font-semibold">Rapport CITES</h2>
              <p className="text-slate-400 text-sm">Inventaire des espèces protégées et permis</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-slate-300 text-sm">Ce rapport inclut :</p>
              <ul className="text-slate-400 text-sm mt-2 space-y-1">
                <li>• Liste complète des animaux CITES Annexe I, II et III</li>
                <li>• Statut des permis d'importation/exportation</li>
                <li>• Historique des acquisitions et transferts</li>
                <li>• Conformité réglementaire</li>
              </ul>
            </div>
          </div>
          <button
            onClick={downloadCitesReport}
            disabled={downloadingCites}
            className="w-full bg-green-700 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {downloadingCites ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Génération en cours...
              </>
            ) : (
              <>📥 Télécharger le rapport CITES (PDF)</>
            )}
          </button>
        </div>

        {/* Rapport annuel */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📊</span>
            <div>
              <h2 className="text-white font-semibold">Rapport Annuel</h2>
              <p className="text-slate-400 text-sm">Bilan complet de l'exercice</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-slate-300 text-sm">Ce rapport inclut :</p>
              <ul className="text-slate-400 text-sm mt-2 space-y-1">
                <li>• Naissances, décès et acquisitions de l'année</li>
                <li>• Bilan financier (ventes, dépenses)</li>
                <li>• Activités de formation et certification</li>
                <li>• Indicateurs de performance clés</li>
              </ul>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Année du rapport</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={downloadAnnualReport}
            disabled={downloadingAnnual}
            className="w-full bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {downloadingAnnual ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Génération en cours...
              </>
            ) : (
              <>📥 Télécharger le rapport {selectedYear} (PDF)</>
            )}
          </button>
        </div>
      </div>

      {/* Informations réglementaires */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h2 className="text-white font-semibold mb-3">ℹ️ Informations réglementaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-yellow-400 font-semibold mb-1">Convention CITES</p>
            <p className="text-slate-300">La Convention sur le commerce international des espèces de faune et de flore sauvages menacées d'extinction (CITES) réglemente le commerce de plus de 38 000 espèces.</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-blue-400 font-semibold mb-1">Obligations déclaratives</p>
            <p className="text-slate-300">Les établissements détenant des espèces protégées sont tenus de produire un inventaire annuel et de déclarer tout mouvement d'animaux CITES.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
