'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileSignature, Users, Calendar, Plus, CheckCircle, Clock,
  Download, ChevronDown, ChevronRight, PenLine, AlertCircle
} from 'lucide-react';
import { formationApi } from '@/lib/api';

function AttendanceSheetCard({ sheet, cohortId }: { sheet: any; cohortId: string }) {
  const [expanded, setExpanded] = useState(false);
  const { data: signatures = [] } = useQuery({
    queryKey: ['signatures', sheet.id],
    queryFn: () => formationApi.getSignatures(sheet.enrollmentId || sheet.id),
    enabled: expanded,
  });

  const signedCount = sheet.signatures?.length || 0;
  const totalExpected = sheet.expectedCount || 0;
  const rate = totalExpected > 0 ? Math.round((signedCount / totalExpected) * 100) : 0;

  return (
    <div className="lftg-card overflow-hidden">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileSignature className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800">{sheet.title || `Séance du ${new Date(sheet.sessionDate).toLocaleDateString('fr-FR')}`}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {new Date(sheet.sessionDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {sheet.duration ? `${sheet.duration}h` : 'Durée non définie'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="flex items-center gap-1">
              <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${rate}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700">{rate}%</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{signedCount}/{totalExpected} signatures</p>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4">
          <div className="grid grid-cols-2 gap-3">
            {sheet.signatures?.map((sig: any) => (
              <div key={sig.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{sig.user?.name}</p>
                  <p className="text-xs text-gray-400">{new Date(sig.signedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {sig.signatureData && (
                  <img src={sig.signatureData} alt="signature" className="w-16 h-8 object-contain border border-gray-200 rounded bg-white" />
                )}
              </div>
            ))}
            {(!sheet.signatures || sheet.signatures.length === 0) && (
              <div className="col-span-2 text-center py-4 text-gray-400">
                <PenLine className="w-6 h-6 mx-auto mb-1 opacity-30" />
                <p className="text-sm">Aucune signature enregistrée pour cette séance</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmargementPage() {
  const qc = useQueryClient();
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const [newSheet, setNewSheet] = useState({ title: '', sessionDate: '', duration: '7', expectedCount: '10' });

  const { data: cohorts = [] } = useQuery({ queryKey: ['cohorts'], queryFn: () => formationApi.cohorts() });
  const { data: sheets = [], isLoading } = useQuery({
    queryKey: ['attendance', selectedCohort],
    queryFn: () => formationApi.getAttendanceSheets(selectedCohort),
    enabled: !!selectedCohort,
  });

  const createMutation = useMutation({
    mutationFn: () => formationApi.createAttendanceSheet(selectedCohort, {
      ...newSheet,
      duration: parseFloat(newSheet.duration),
      expectedCount: parseInt(newSheet.expectedCount),
      sessionDate: new Date(newSheet.sessionDate).toISOString(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', selectedCohort] });
      setShowCreate(false);
      setNewSheet({ title: '', sessionDate: '', duration: '7', expectedCount: '10' });
    },
  });

  const totalSheets = (sheets as any[]).length;
  const avgRate = totalSheets > 0
    ? Math.round((sheets as any[]).reduce((s: number, sh: any) => {
        const signed = sh.signatures?.length || 0;
        const expected = sh.expectedCount || 1;
        return s + (signed / expected) * 100;
      }, 0) / totalSheets)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <FileSignature className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Feuilles d'émargement</h1>
            <p className="text-sm text-muted-foreground">Signatures numériques — Indicateur 10 Qualiopi</p>
          </div>
        </div>
        {selectedCohort && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle séance
          </button>
        )}
      </div>

      {/* Sélecteur de cohorte */}
      <div className="lftg-card p-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Sélectionner une cohorte</label>
        <select
          value={selectedCohort}
          onChange={(e) => setSelectedCohort(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-forest-500 focus:border-transparent"
        >
          <option value="">— Choisir une cohorte —</option>
          {(cohorts as any[]).map((c: any) => (
            <option key={c.id} value={c.id}>{c.course?.title} — {c.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      {selectedCohort && totalSheets > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="lftg-card p-4 text-center">
            <FileSignature className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{totalSheets}</p>
            <p className="text-xs text-gray-500">Séances enregistrées</p>
          </div>
          <div className="lftg-card p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{avgRate}%</p>
            <p className="text-xs text-gray-500">Taux d'assiduité moyen</p>
          </div>
          <div className="lftg-card p-4 text-center">
            <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${avgRate < 70 ? 'text-red-500' : 'text-gray-300'}`} />
            <p className={`text-2xl font-bold ${avgRate < 70 ? 'text-red-600' : 'text-gray-800'}`}>
              {avgRate < 70 ? 'Alerte' : 'OK'}
            </p>
            <p className="text-xs text-gray-500">Seuil Qualiopi (70%)</p>
          </div>
        </div>
      )}

      {/* Formulaire de création */}
      {showCreate && (
        <div className="lftg-card p-4 border-forest-200 bg-forest-50/30">
          <h3 className="font-semibold text-gray-800 mb-4">Nouvelle feuille d'émargement</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Titre de la séance</label>
              <input
                value={newSheet.title}
                onChange={(e) => setNewSheet((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Bloc 1 — Soins aux animaux exotiques"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Date de la séance</label>
              <input
                type="datetime-local"
                value={newSheet.sessionDate}
                onChange={(e) => setNewSheet((f) => ({ ...f, sessionDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Durée (heures)</label>
              <input
                type="number"
                step="0.5"
                value={newSheet.duration}
                onChange={(e) => setNewSheet((f) => ({ ...f, duration: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre d'apprenants attendus</label>
              <input
                type="number"
                value={newSheet.expectedCount}
                onChange={(e) => setNewSheet((f) => ({ ...f, expectedCount: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!newSheet.sessionDate || createMutation.isPending}
              className="px-4 py-2 text-sm bg-forest-600 text-white rounded-lg hover:bg-forest-700 disabled:opacity-50"
            >
              Créer la feuille
            </button>
          </div>
        </div>
      )}

      {/* Liste des feuilles */}
      {!selectedCohort && (
        <div className="text-center py-16 text-gray-400">
          <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Sélectionnez une cohorte pour afficher les feuilles d'émargement</p>
        </div>
      )}

      {selectedCohort && isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {selectedCohort && !isLoading && (sheets as any[]).length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FileSignature className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Aucune feuille d'émargement pour cette cohorte</p>
          <p className="text-sm mt-1">Créez une nouvelle séance pour commencer</p>
        </div>
      )}

      <div className="space-y-3">
        {(sheets as any[]).map((sheet: any) => (
          <AttendanceSheetCard key={sheet.id} sheet={sheet} cohortId={selectedCohort} />
        ))}
      </div>
    </div>
  );
}
