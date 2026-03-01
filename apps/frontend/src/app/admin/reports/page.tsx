'use client';
import { useState } from 'react';

const REPORT_TYPES = [
  {
    id: 'monthly',
    titre: 'Rapport mensuel',
    description: 'Synthèse complète de l\'activité : animaux, ventes, stock, personnel et couvées',
    icon: '📊',
    couleur: 'from-forest-500 to-forest-700',
    params: ['Mois', 'Année'],
    dernierGenere: '01/02/2026',
    taille: '2.4 Mo',
  },
  {
    id: 'medical',
    titre: 'Dossier médical animal',
    description: 'Historique complet des soins, vaccinations et traitements d\'un animal',
    icon: '🩺',
    couleur: 'from-blue-500 to-blue-700',
    params: ['Animal'],
    dernierGenere: '28/02/2026',
    taille: '1.1 Mo',
  },
  {
    id: 'cites',
    titre: 'Bilan CITES',
    description: 'État des permis, conformité réglementaire et espèces protégées',
    icon: '📜',
    couleur: 'from-purple-500 to-purple-700',
    params: [],
    dernierGenere: '15/02/2026',
    taille: '890 Ko',
  },
  {
    id: 'hr',
    titre: 'Rapport RH',
    description: 'Effectifs, congés, planning des gardes et heures supplémentaires',
    icon: '👥',
    couleur: 'from-orange-500 to-orange-700',
    params: ['Période'],
    dernierGenere: '01/03/2026',
    taille: '1.8 Mo',
  },
  {
    id: 'inventory',
    titre: 'Inventaire stock',
    description: 'État complet du stock avec alertes, mouvements et valorisation',
    icon: '📦',
    couleur: 'from-amber-500 to-amber-700',
    params: ['Date'],
    dernierGenere: '28/02/2026',
    taille: '650 Ko',
  },
  {
    id: 'sales',
    titre: 'Rapport ventes',
    description: 'Analyse des ventes, chiffre d\'affaires, top espèces et clients',
    icon: '💰',
    couleur: 'from-emerald-500 to-emerald-700',
    params: ['Période'],
    dernierGenere: '01/03/2026',
    taille: '1.2 Mo',
  },
];

const RECENT_REPORTS = [
  { titre: 'Rapport mensuel — Février 2026', date: '01/03/2026', type: 'monthly', taille: '2.4 Mo', statut: 'Prêt' },
  { titre: 'Rapport RH — Q1 2026', date: '01/03/2026', type: 'hr', taille: '1.8 Mo', statut: 'Prêt' },
  { titre: 'Dossier médical — Ara Bleu (E-03)', date: '28/02/2026', type: 'medical', taille: '1.1 Mo', statut: 'Prêt' },
  { titre: 'Bilan CITES — Février 2026', date: '15/02/2026', type: 'cites', taille: '890 Ko', statut: 'Prêt' },
  { titre: 'Inventaire stock — 28/02/2026', date: '28/02/2026', type: 'inventory', taille: '650 Ko', statut: 'Prêt' },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<typeof REPORT_TYPES[0] | null>(null);
  const [showParamsModal, setShowParamsModal] = useState(false);

  const handleGenerate = (report: typeof REPORT_TYPES[0]) => {
    if (report.params.length > 0) {
      setSelectedReport(report);
      setShowParamsModal(true);
    } else {
      simulateGeneration(report.id);
    }
  };

  const simulateGeneration = (id: string) => {
    setGenerating(id);
    setShowParamsModal(false);
    setTimeout(() => setGenerating(null), 2500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Exports</h1>
          <p className="text-sm text-gray-500 mt-1">Générez des rapports PDF complets pour chaque module</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Moteur PDF actif
        </div>
      </div>

      {/* Grille des types de rapports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map(report => (
          <div key={report.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Bannière colorée */}
            <div className={`bg-gradient-to-r ${report.couleur} p-4 flex items-center gap-3`}>
              <span className="text-3xl">{report.icon}</span>
              <div>
                <h3 className="font-semibold text-white">{report.titre}</h3>
                <p className="text-xs text-white/70 mt-0.5">Dernier : {report.dernierGenere}</p>
              </div>
            </div>

            {/* Corps */}
            <div className="p-4">
              <p className="text-sm text-gray-500 leading-relaxed">{report.description}</p>

              {report.params.length > 0 && (
                <div className="flex items-center gap-1 mt-3 flex-wrap">
                  <span className="text-xs text-gray-400">Paramètres :</span>
                  {report.params.map(p => (
                    <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleGenerate(report)}
                  disabled={generating === report.id}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    generating === report.id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-forest-600 text-white hover:bg-forest-700'
                  }`}
                >
                  {generating === report.id ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Génération...
                    </>
                  ) : (
                    <>📄 Générer PDF</>
                  )}
                </button>
                <button className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors" title="Télécharger le dernier">
                  ⬇
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rapports récents */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Rapports récents</h2>
          <button className="text-sm text-gray-400 hover:text-gray-600">Voir tout</button>
        </div>
        <div className="divide-y divide-gray-50">
          {RECENT_REPORTS.map((r, i) => {
            const rt = REPORT_TYPES.find(t => t.id === r.type);
            return (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <span className="text-2xl">{rt?.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{r.titre}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{r.date} · {r.taille}</div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{r.statut}</span>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-forest-600 hover:text-forest-700 font-medium">Voir</button>
                  <button className="text-xs text-gray-400 hover:text-gray-600">⬇</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal paramètres */}
      {showParamsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedReport.icon}</span>
                <h2 className="text-lg font-bold text-gray-900">{selectedReport.titre}</h2>
              </div>
              <button onClick={() => setShowParamsModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-4">
              {selectedReport.params.includes('Mois') && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mois</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'].map((m, i) => (
                      <option key={m} selected={i === 1}>{m}</option>
                    ))}
                  </select>
                </div>
              )}
              {selectedReport.params.includes('Année') && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Année</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>2026</option>
                    <option>2025</option>
                    <option>2024</option>
                  </select>
                </div>
              )}
              {selectedReport.params.includes('Animal') && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Animal</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>Ara Bleu — E-03</option>
                    <option>Caïman — R-03</option>
                    <option>Dendrobate — A-01</option>
                    <option>Amazona — E-07</option>
                  </select>
                </div>
              )}
              {selectedReport.params.includes('Période') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date début</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date fin</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              )}
              {selectedReport.params.includes('Date') && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date d'inventaire</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowParamsModal(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={() => simulateGeneration(selectedReport.id)}
                className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700"
              >
                📄 Générer le rapport
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
