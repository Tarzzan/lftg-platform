'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { enclosApi } from '@/lib/api';

interface Enclosure {
  id: string;
  name: string;
  code?: string;
  type: string;
  capacity: number;
  currentOccupancy?: number;
  surface?: number;
  latitude?: number;
  longitude?: number;
  description?: string;
  status: string;
  animals?: Animal[];
}

interface Animal {
  id: string;
  name: string;
  identifier: string;
  status: string;
  species?: { commonName: string; scientificName: string };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-600',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
};

const ANIMAL_STATUS_COLORS: Record<string, string> = {
  ALIVE: 'bg-green-100 text-green-700',
  CARE: 'bg-yellow-100 text-yellow-700',
  DECEASED: 'bg-red-100 text-red-700',
};

export default function EnclosDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [enclosure, setEnclosure] = useState<Enclosure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'animals' | 'edit'>('info');
  const [editData, setEditData] = useState<Partial<Enclosure>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    enclosApi.get(id)
      .then((data) => {
        setEnclosure(data);
        setEditData({
          name: data.name,
          type: data.type,
          capacity: data.capacity,
          description: data.description,
          status: data.status,
        });
      })
      .catch((e: any) => setError(e?.response?.data?.message || 'Enclos introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const updated = await enclosApi.update(id, editData);
      setEnclosure(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Chargement de l&apos;enclos...</p>
        </div>
      </div>
    );
  }

  if (error || !enclosure) {
    return (
      <div className="p-6">
        <Link href="/admin/animaux/enclos" className="text-gray-400 hover:text-gray-600 dark:text-gray-400 text-sm mb-4 inline-block">
          ← Retour aux enclos
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">{error || 'Enclos introuvable'}</p>
          <button
            onClick={() => router.push('/admin/animaux/enclos')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const occupancyPct = enclosure.capacity > 0
    ? Math.round(((enclosure.currentOccupancy ?? 0) / enclosure.capacity) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/animaux/enclos" className="hover:text-gray-700">Enclos</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-foreground font-medium">{enclosure.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{enclosure.name}</h1>
          {enclosure.code && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Code : {enclosure.code}</p>}
          {enclosure.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 max-w-xl">{enclosure.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[enclosure.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {enclosure.status}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Type', value: enclosure.type, color: 'text-blue-600' },
          { label: 'Capacité', value: `${enclosure.currentOccupancy ?? 0} / ${enclosure.capacity}`, color: 'text-green-600' },
          { label: 'Surface', value: enclosure.surface ? `${enclosure.surface} m²` : '—', color: 'text-purple-600' },
          { label: 'Occupation', value: `${occupancyPct}%`, color: occupancyPct > 90 ? 'text-red-600' : 'text-orange-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-border shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{kpi.label}</p>
            <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Barre d'occupation */}
      <div className="bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-border shadow-sm">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Taux d&apos;occupation</span>
          <span className="text-gray-500">{enclosure.currentOccupancy ?? 0} / {enclosure.capacity} animaux</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${occupancyPct > 90 ? 'bg-red-500' : occupancyPct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(occupancyPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-border">
          {(['info', 'animals', 'edit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              {tab === 'info' ? 'Informations' : tab === 'animals' ? `Animaux (${enclosure.animals?.length ?? 0})` : 'Modifier'}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Paramètres environnementaux</h3>
              <p className="text-sm text-gray-400 italic">Non renseigné</p>
            </div>
            {enclosure.latitude && enclosure.longitude && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Localisation GPS</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Latitude</span>
                  <span className="font-mono">{enclosure.latitude}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Longitude</span>
                  <span className="font-mono">{enclosure.longitude}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'animals' && (
          <div className="p-4">
            {(!enclosure.animals || enclosure.animals.length === 0) ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-3">🐾</p>
                <p className="font-medium text-gray-600">Aucun animal dans cet enclos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-muted/20 text-xs text-gray-500 dark:text-gray-400 uppercase">
                    <tr>
                      {['Identifiant', 'Nom', 'Espèce', 'Statut'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enclosure.animals.map((animal) => (
                      <tr key={animal.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{animal.identifier}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{animal.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 italic text-xs">
                          {animal.species?.scientificName ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ANIMAL_STATUS_COLORS[animal.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {animal.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="p-6 space-y-4 max-w-lg">
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                ✅ Enclos mis à jour avec succès
              </div>
            )}
            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {saveError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
              <input
                value={editData.name ?? ''}
                onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={editData.type ?? ''}
                onChange={(e) => setEditData((d) => ({ ...d, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {['VOLIERE', 'TERRARIUM', 'BASSIN', 'PADDOCK', 'CAGE', 'indoor', 'outdoor'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacité maximale</label>
              <input
                type="number"
                value={editData.capacity ?? 0}
                onChange={(e) => setEditData((d) => ({ ...d, capacity: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={editData.description ?? ''}
                onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
              <select
                value={editData.status ?? ''}
                onChange={(e) => setEditData((d) => ({ ...d, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {['ACTIVE', 'INACTIVE', 'MAINTENANCE'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Sauvegarde...' : '💾 Sauvegarder les modifications'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
