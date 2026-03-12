'use client';
import { api } from '@/lib/api';
import { useState } from 'react';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  endpoint: string;
  filename: string;
  icon: string;
  color: string;
}

const EXPORTS: ExportOption[] = [
  {
    id: 'animals',
    label: 'Animaux (CSV)',
    description: 'Export complet de tous les animaux avec leurs données',
    endpoint: '/export/animaux/csv',
    filename: 'animaux.csv',
    icon: '',
    color: 'border-indigo-700',
  },
  {
    id: 'stock',
    label: 'Stock (CSV)',
    description: 'Inventaire complet du stock avec quantités et alertes',
    endpoint: '/export/stock/csv',
    filename: 'stock.csv',
    icon: '',
    color: 'border-green-700',
  },
  {
    id: 'personnel',
    label: 'Personnel (CSV)',
    description: 'Liste du personnel avec postes et informations de contact',
    endpoint: '/export/personnel/csv',
    filename: 'personnel.csv',
    icon: '',
    color: 'border-blue-700',
  },
  {
    id: 'formation',
    label: 'Formations (CSV)',
    description: 'Catalogue des formations et inscriptions',
    endpoint: '/export/formation/csv',
    filename: 'formations.csv',
    icon: '',
    color: 'border-yellow-700',
  },
  {
    id: 'audit',
    label: 'Audit (CSV)',
    description: 'Journal d\'audit complet des actions utilisateurs',
    endpoint:'/export/audit/csv',
    filename:'audit.csv',
    icon:'',
    color:'border-purple-700',
  },
  {
    id:'stock-report',
    label:'Rapport stock (PDF)',
    description:'Rapport PDF complet de l\'inventaire avec alertes et valorisation',
    endpoint: '/export/stock/report',
    filename: 'rapport-stock.pdf',
    icon: '',
    color: 'border-red-700',
  },
];

export default function ExportPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successes, setSuccesses] = useState<Record<string, boolean>>({});

  const handleExport = async (option: ExportOption) => {
    setDownloading(option.id);
    setErrors((e) => ({ ...e, [option.id]: '' }));
    setSuccesses((s) => ({ ...s, [option.id]: false }));

    try {
      const res = await api.get(option.endpoint, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = option.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccesses((s) => ({ ...s, [option.id]: true }));
      setTimeout(() => setSuccesses((s) => ({ ...s, [option.id]: false })), 3000);
    } catch (err: any) {
      setErrors((e) => ({ ...e, [option.id]: err?.response?.data?.message || 'Erreur lors de l\'export' }));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Export de données</h1>
        <p className="text-slate-400 mt-1">Téléchargez vos données en CSV ou PDF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPORTS.map((option) => (
          <div key={option.id} className={`bg-slate-800 rounded-xl p-5 border ${option.color} transition-all hover:bg-slate-750`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-3xl">{option.icon}</span>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{option.label}</h3>
                  <p className="text-slate-400 text-sm mt-1">{option.description}</p>
                  {errors[option.id] && (
                    <p className="text-red-400 text-xs mt-2">{errors[option.id]}</p>
                  )}
                  {successes[option.id] && (
                    <p className="text-green-400 text-xs mt-2">Téléchargement démarré</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleExport(option)}
                disabled={downloading === option.id}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-2 text-sm"
              >
                {downloading === option.id ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                    Export...
                  </>
                ) : (
                  <>⬇ Exporter</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">Les exports CSV sont compatibles avec Excel, LibreOffice et Google Sheets. Les exports PDF sont générés avec les données en temps réel.</p>
      </div>
    </div>
  );
}
