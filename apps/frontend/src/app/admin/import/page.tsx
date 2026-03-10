'use client';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, Download, FileText, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

const IMPORT_TYPES = [
  { key: 'animals', label: 'Animaux', description: 'Importer des fiches animaux (CSV)', endpoint: '/import/animals', template: '/import/template/animals' },
  { key: 'stock', label: 'Stock', description: 'Importer des articles de stock (CSV)', endpoint: '/import/stock', template: '/import/template/stock' },
  { key: 'personnel', label: 'Personnel', description: 'Importer des employés (CSV)', endpoint: '/import/personnel', template: '/import/template/personnel' },
  { key: 'medical', label: 'Visites médicales', description: 'Importer des visites vétérinaires (CSV)', endpoint: '/import/medical', template: '/import/template/medical' },
];

export default function ImportPage() {
  const [selectedType, setSelectedType] = useState(IMPORT_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<null | { success: boolean; imported?: number; errors?: string[]; message?: string }>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const importMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post(selectedType.endpoint, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data;
    },
    onSuccess: (data) => setResult({ success: true, imported: data.imported ?? data.count, errors: data.errors }),
    onError: (e: any) => setResult({ success: false, message: e?.response?.data?.message ?? 'Erreur lors de l\'import' }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setResult(null);
  };

  const handleImport = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    importMutation.mutate(fd);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get(selectedType.template, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${selectedType.key}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback : générer un CSV minimal
      const headers: Record<string, string> = {
        animals: 'name,species,birthDate,sex,identificationNumber\n',
        stock: 'name,category,quantity,unit,lowStockThreshold\n',
        personnel: 'name,email,role,startDate\n',
        medical: 'animalId,visitDate,type,diagnosis,treatment\n',
      };
      const blob = new Blob([headers[selectedType.key] ?? ''], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${selectedType.key}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Upload className="w-7 h-7 text-indigo-600" />
          Import de données
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Importer des données en masse depuis des fichiers CSV</p>
      </div>

      {/* Sélection du type */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {IMPORT_TYPES.map(t => (
          <button key={t.key} onClick={() => { setSelectedType(t); setFile(null); setResult(null); }}
            className={`p-4 rounded-xl border text-left transition-all ${selectedType.key === t.key ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-white dark:bg-gray-800 hover:border-indigo-200'}`}>
            <FileText className={`w-5 h-5 mb-2 ${selectedType.key === t.key ? 'text-indigo-600' : 'text-gray-400'}`} />
            <p className={`font-medium text-sm ${selectedType.key === t.key ? 'text-indigo-900' : 'text-gray-900'}`}>{t.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.description}</p>
          </button>
        ))}
      </div>

      {/* Zone d'import */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Import : {selectedType.label}</h2>
          <button onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 text-sm transition-colors">
            <Download className="w-4 h-4" />
            Télécharger le modèle CSV
          </button>
        </div>

        {/* Drag & drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${file ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 dark:border-border hover:border-indigo-300 hover:bg-gray-50'}`}>
          <input ref={fileRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="hidden" />
          {file ? (
            <div>
              <CheckCircle className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="font-medium text-indigo-900">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} Ko</p>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-medium text-gray-600">Cliquez pour sélectionner un fichier</p>
              <p className="text-sm text-gray-400 mt-1">CSV ou Excel (.xlsx) — max 10 Mo</p>
            </div>
          )}
        </div>

        {/* Bouton import */}
        <button onClick={handleImport} disabled={!file || importMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors">
          {importMutation.isPending ? (
            <><RefreshCw className="w-5 h-5 animate-spin" />Import en cours...</>
          ) : (
            <><Upload className="w-5 h-5" />Importer {selectedType.label}</>
          )}
        </button>

        {/* Résultat */}
        {result && (
          <div className={`rounded-xl p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
              <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? `${result.imported ?? 0} enregistrement(s) importé(s) avec succès` : result.message ?? 'Erreur lors de l\'import'}
              </p>
            </div>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-yellow-800 flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  {result.errors.length} avertissement(s)
                </p>
                <ul className="text-xs text-yellow-700 space-y-0.5 max-h-32 overflow-y-auto">
                  {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. Téléchargez le modèle CSV pour le type de données souhaité</li>
          <li>2. Remplissez le fichier en respectant les colonnes requises</li>
          <li>3. Sélectionnez votre fichier et cliquez sur "Importer"</li>
          <li>4. Vérifiez les résultats et corrigez les éventuelles erreurs</li>
        </ul>
      </div>
    </div>
  );
}
