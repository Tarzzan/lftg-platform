'use client';
import { useState } from 'react';

const reports = [
  {
    id: 'RPT-CITES-2025',
    title: 'Rapport CITES Annuel 2025',
    type: 'cites',
    date: '2026-01-15',
    status: 'generated',
    pages: 24,
    size: '1.8 MB',
    desc: 'Déclaration annuelle des animaux CITES Annexe I et II — DREAL Guyane',
  },
  {
    id: 'RPT-ANNUAL-2025',
    title: 'Bilan Annuel 2025',
    type: 'annual',
    date: '2026-01-20',
    status: 'generated',
    pages: 48,
    size: '3.2 MB',
    desc: 'Rapport complet d\'activité : naissances, décès, soins, finances, visiteurs',
  },
  {
    id: 'RPT-VET-Q4-2025',
    title: 'Rapport Vétérinaire T4 2025',
    type: 'veterinary',
    date: '2026-01-05',
    status: 'generated',
    pages: 16,
    size: '0.9 MB',
    desc: 'Bilan sanitaire trimestriel — interventions, traitements, mortalité',
  },
  {
    id: 'RPT-CITES-Q1-2026',
    title: 'Rapport CITES T1 2026',
    type: 'cites',
    date: '2026-03-01',
    status: 'generating',
    pages: null,
    size: null,
    desc: 'En cours de génération — Déclaration trimestrielle',
  },
  {
    id: 'RPT-DRAAF-2025',
    title: 'Déclaration DRAAF 2025',
    type: 'regulatory',
    date: '2026-02-01',
    status: 'generated',
    pages: 8,
    size: '0.4 MB',
    desc: 'Direction Régionale de l\'Alimentation, de l\'Agriculture et de la Forêt',
  },
];

const stats2025 = [
  { label: 'Naissances', value: 47, trend: '+12%', icon: '🐣', color: 'text-green-600' },
  { label: 'Décès', value: 8, trend: '-25%', icon: '💔', color: 'text-red-600' },
  { label: 'Acquisitions', value: 15, trend: '+5%', icon: '📥', color: 'text-blue-600' },
  { label: 'Cessions', value: 6, trend: '-10%', icon: '📤', color: 'text-orange-600' },
  { label: 'Soins vétérinaires', value: 234, trend: '+8%', icon: '💊', color: 'text-purple-600' },
  { label: 'Visiteurs', value: 12847, trend: '+22%', icon: '👥', color: 'text-teal-600' },
];

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  cites: { label: 'CITES', color: 'bg-green-100 text-green-700', icon: '🌿' },
  annual: { label: 'Annuel', color: 'bg-blue-100 text-blue-700', icon: '📅' },
  veterinary: { label: 'Vétérinaire', color: 'bg-red-100 text-red-700', icon: '🏥' },
  regulatory: { label: 'Réglementaire', color: 'bg-orange-100 text-orange-700', icon: '⚖️' },
};

export default function AdvancedReportsPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'generate' | 'stats'>('reports');
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('cites');
  const [selectedYear, setSelectedYear] = useState('2025');

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports Avancés</h1>
          <p className="text-gray-500 text-sm mt-1">Rapports CITES, bilans annuels, rapports vétérinaires et déclarations réglementaires</p>
        </div>
        <button
          onClick={() => setActiveTab('generate')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
        >
          + Générer un rapport
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Rapports générés', value: reports.filter(r => r.status === 'generated').length, icon: '📄', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En cours', value: reports.filter(r => r.status === 'generating').length, icon: '⏳', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Rapports CITES', value: reports.filter(r => r.type === 'cites').length, icon: '🌿', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Déclarations réglementaires', value: reports.filter(r => r.type === 'regulatory').length, icon: '⚖️', color: 'text-orange-600', bg: 'bg-orange-50' },
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
          { key: 'reports', label: '📄 Rapports générés' },
          { key: 'generate', label: '⚙️ Générer un rapport' },
          { key: 'stats', label: '📊 Statistiques 2025' },
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

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.map((report) => {
            const config = typeConfig[report.type];
            return (
              <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>{config.label}</span>
                      {report.status === 'generating' && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full animate-pulse">⏳ En cours...</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{report.desc}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {report.date}
                      {report.pages && ` · ${report.pages} pages`}
                      {report.size && ` · ${report.size}`}
                    </p>
                  </div>
                </div>
                {report.status === 'generated' && (
                  <div className="flex gap-2">
                    <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200">
                      👁️ Aperçu
                    </button>
                    <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                      ⬇️ Télécharger PDF
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="max-w-lg">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Paramètres du rapport</h3>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Type de rapport</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(typeConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedType(key)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedType === key ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{config.icon}</span>
                    <p className="text-sm font-medium text-gray-800 mt-1">{config.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Période</label>
              <div className="flex gap-2">
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {['2026', '2025', '2024', '2023'].map(y => <option key={y}>{y}</option>)}
                </select>
                <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Annuel</option>
                  <option>T1</option>
                  <option>T2</option>
                  <option>T3</option>
                  <option>T4</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Format de sortie</label>
              <div className="flex gap-2">
                {['PDF', 'Excel', 'Word'].map(fmt => (
                  <button key={fmt} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:border-green-500 hover:bg-green-50">
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                generating
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {generating ? '⏳ Génération en cours...' : '⚙️ Générer le rapport'}
            </button>
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {stats2025.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.icon} {stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color} mt-1`}>{stat.value.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">vs 2024</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">📈 Évolution mensuelle 2025 — Naissances</h3>
            <div className="flex items-end gap-2 h-24">
              {[3, 5, 4, 6, 8, 7, 5, 4, 3, 4, 6, 5].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-green-400 rounded-t hover:bg-green-500 transition-colors"
                    style={{ height: `${(val / 8) * 100}%` }}
                    title={`${val} naissances`}
                  ></div>
                  <span className="text-xs text-gray-400">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
