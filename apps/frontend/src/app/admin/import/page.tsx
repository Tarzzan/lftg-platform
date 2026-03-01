'use client';

import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Upload, FileText, Download, CheckCircle, XCircle,
  AlertCircle, Bird, Package, Users, ChevronRight,
  Loader2, RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type ImportType = 'animals' | 'stock' | 'users';

interface ImportResult {
  success: number;
  errors: number;
  skipped: number;
  details: Array<{ row: number; status: 'success' | 'error' | 'skipped'; message?: string }>;
}

// ─── Config des types d'import ────────────────────────────────────────────────

const IMPORT_TYPES = [
  {
    id: 'animals' as ImportType,
    label: 'Animaux',
    icon: <Bird className="w-5 h-5" />,
    color: 'text-forest-600 bg-forest-50 border-forest-200',
    selectedColor: 'bg-forest-600 text-white border-forest-600',
    description: 'Importer des fiches animaux depuis un fichier CSV',
    columns: ['name *', 'identifier', 'species_name *', 'scientific_name', 'sex', 'birth_date', 'status', 'enclosure_name', 'notes'],
  },
  {
    id: 'stock' as ImportType,
    label: 'Articles stock',
    icon: <Package className="w-5 h-5" />,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    selectedColor: 'bg-amber-600 text-white border-amber-600',
    description: 'Importer des articles de stock depuis un fichier CSV',
    columns: ['name *', 'category', 'quantity', 'unit', 'threshold', 'location', 'description'],
  },
  {
    id: 'users' as ImportType,
    label: 'Utilisateurs',
    icon: <Users className="w-5 h-5" />,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    selectedColor: 'bg-blue-600 text-white border-blue-600',
    description: 'Importer des comptes utilisateurs depuis un fichier CSV',
    columns: ['email *', 'name', 'role'],
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ImportPage() {
  const [selectedType, setSelectedType] = useState<ImportType>('animals');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const typeConfig = IMPORT_TYPES.find(t => t.id === selectedType)!;

  // ─── Import mutation ────────────────────────────────────────────────────────

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Aucun fichier sélectionné');
      const content = await file.text();
      const response = await api.post(`/import/${selectedType}/raw`, { csv: content });
      return response.data as ImportResult;
    },
    onSuccess: (data) => setResult(data),
  });

  // ─── Gestion du fichier ──────────────────────────────────────────────────────

  const parseCSVPreview = useCallback((content: string) => {
    const lines = content.trim().split('\n').slice(0, 6);
    return lines.map(l => l.split(',').map(v => v.trim().replace(/^"|"$/g, '')));
  }, []);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith('.csv')) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setPreview(parseCSVPreview(content));
    };
    reader.readAsText(f);
  }, [parseCSVPreview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDownloadTemplate = async () => {
    const response = await api.get(`/import/template/${selectedType}`);
    const { csv, filename } = response.data;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Import CSV</h1>
        <p className="text-muted-foreground text-sm mt-1">Importez des données en masse depuis des fichiers CSV</p>
      </div>

      {/* Sélection du type */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Type de données à importer</p>
        <div className="grid grid-cols-3 gap-3">
          {IMPORT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => { setSelectedType(type.id); reset(); }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedType === type.id ? type.selectedColor : `${type.color} hover:opacity-80`
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {type.icon}
                <span className="font-semibold text-sm">{type.label}</span>
              </div>
              <p className={`text-xs ${selectedType === type.id ? 'text-white/80' : 'opacity-70'}`}>
                {type.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Colonnes attendues + template */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Format attendu</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Colonnes du fichier CSV (* = obligatoire)</p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger le modèle
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeConfig.columns.map(col => (
            <span
              key={col}
              className={`text-xs px-2.5 py-1 rounded-full border font-mono ${
                col.endsWith('*')
                  ? 'bg-laterite-50 text-laterite-700 border-laterite-300 font-semibold'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {col}
            </span>
          ))}
        </div>
      </div>

      {/* Zone de dépôt */}
      {!result && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            isDragging ? 'border-forest-500 bg-forest-50' : 'border-border hover:border-forest-400 hover:bg-muted/30'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-forest-600' : 'text-muted-foreground'}`} />
          {file ? (
            <div>
              <p className="font-semibold text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} Ko · Cliquez pour changer</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-foreground">Glissez votre fichier CSV ici</p>
              <p className="text-sm text-muted-foreground mt-1">ou cliquez pour parcourir</p>
              <p className="text-xs text-muted-foreground mt-2">Taille maximale : 10 Mo</p>
            </div>
          )}
        </div>
      )}

      {/* Prévisualisation */}
      {preview.length > 0 && !result && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-forest-600" />
              Prévisualisation ({preview.length - 1} ligne{preview.length - 1 !== 1 ? 's' : ''} + en-tête)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  {preview[0]?.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {preview.slice(1).map((row, ri) => (
                  <tr key={ri} className="hover:bg-muted/20">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-foreground whitespace-nowrap max-w-32 truncate">{cell || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bouton d'import */}
      {file && !result && (
        <div className="flex justify-end gap-3">
          <button onClick={reset} className="btn-secondary">Annuler</button>
          <button
            onClick={() => importMutation.mutate()}
            disabled={importMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {importMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Import en cours...</>
            ) : (
              <><Upload className="w-4 h-4" />Lancer l'import</>
            )}
          </button>
        </div>
      )}

      {/* Résultats */}
      {result && (
        <div className="space-y-4">
          {/* Résumé */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-5 h-5 text-green-600" /></div>
              <p className="text-2xl font-bold text-green-700">{result.success}</p>
              <p className="text-xs text-green-600 mt-0.5">Importé{result.success !== 1 ? 's' : ''} avec succès</p>
            </div>
            <div className="card p-4 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2 mb-1"><AlertCircle className="w-5 h-5 text-amber-600" /></div>
              <p className="text-2xl font-bold text-amber-700">{result.skipped}</p>
              <p className="text-xs text-amber-600 mt-0.5">Ignoré{result.skipped !== 1 ? 's' : ''} (doublons)</p>
            </div>
            <div className="card p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-1"><XCircle className="w-5 h-5 text-red-600" /></div>
              <p className="text-2xl font-bold text-red-700">{result.errors}</p>
              <p className="text-xs text-red-600 mt-0.5">Erreur{result.errors !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Détails */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Détails ligne par ligne</p>
              <button onClick={reset} className="btn-secondary text-xs flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Nouvel import
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {result.details.map(d => (
                <div key={d.row} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  {d.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : d.status === 'skipped' ? (
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-muted-foreground font-mono text-xs w-12 flex-shrink-0">Ligne {d.row}</span>
                  <span className={`flex-1 ${d.status === 'error' ? 'text-red-600' : d.status === 'skipped' ? 'text-amber-600' : 'text-foreground'}`}>
                    {d.message || d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
