'use client';
import { toast } from 'sonner';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  INCUBATION: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ECLOSION: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  TERMINEE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ECHEC: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  // legacy
  incubating: 'bg-blue-100 text-blue-700',
  hatched: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  INCUBATION: 'En incubation',
  ECLOSION: 'Éclosion',
  TERMINEE: 'Terminée',
  ECHEC: 'Échec',
  incubating: 'En incubation',
  hatched: 'Éclos',
  failed: 'Échoué',
};

export default function CouveesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    speciesId: '',
    eggCount: '',
    incubationStartDate: new Date().toISOString().split('T')[0],
    expectedHatchDate: '',
    temperature: '',
    humidity: '',
    incubatorId: '',
    notes: '',
  });

  const { data: broods, isLoading, isError, error } = useQuery({
    queryKey: ['broods'],
    queryFn: () => api.get('/plugins/animaux/broods').then(r => r.data),
  });

  const { data: species } = useQuery({
    queryKey: ['species'],
    queryFn: () => api.get('/plugins/animaux/species').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/plugins/animaux/broods', data),
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['broods'] });
      setShowModal(false);
      setForm({ speciesId: '', eggCount: '', incubationStartDate: new Date().toISOString().split('T')[0], expectedHatchDate: '', temperature: '', humidity: '', incubatorId: '', notes: '' });
    },
  });

  const filtered = (broods || []).filter((b: any) => !filterStatus || b.status === filterStatus);
  const activeCount = (broods || []).filter((b: any) => ['INCUBATION', 'incubating'].includes(b.status)).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-white">Couvées & Incubation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeCount} couvée(s) active(s)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 transition-colors"
        >
          + Nouvelle couvée
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {['', 'INCUBATION', 'ECLOSION', 'TERMINEE', 'ECHEC'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === s
                ? 'bg-forest-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {s === '' ? 'Toutes' : STATUS_LABELS[s] || s}
          </button>
        ))}
      </div>

      {/* Grille */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🥚</p>
          <p>Aucune couvée trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((brood: any) => {
            const daysInIncubation = Math.floor(
              (Date.now() - new Date(brood.incubationStartDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            const daysUntilHatch = brood.expectedHatchDate
              ? Math.floor((new Date(brood.expectedHatchDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;
            const totalDays = brood.expectedHatchDate
              ? Math.floor((new Date(brood.expectedHatchDate).getTime() - new Date(brood.incubationStartDate).getTime()) / (1000 * 60 * 60 * 24))
              : null;
            const progress = totalDays && totalDays > 0 ? Math.min(100, Math.round((daysInIncubation / totalDays) * 100)) : 0;
            const successRate = brood.eggCount > 0 && brood.hatchedCount != null
              ? Math.round((brood.hatchedCount / brood.eggCount) * 100)
              : null;

            return (
              <div
                key={brood.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-border dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/admin/animaux/couvees/${brood.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl">
                      🥚
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-foreground dark:text-white">
                        {brood.species?.name || 'Espèce inconnue'}
                      </p>
                      <p className="text-xs text-gray-500">{brood.eggCount} œufs</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[brood.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[brood.status] || brood.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex justify-between">
                    <span>Début incubation</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                      {new Date(brood.incubationStartDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {brood.expectedHatchDate && (
                    <div className="flex justify-between">
                      <span>Éclosion prévue</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                        {new Date(brood.expectedHatchDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {brood.temperature && (
                    <div className="flex justify-between">
                      <span>Température cible</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">{brood.temperature}°C</span>
                    </div>
                  )}
                </div>

                {['INCUBATION', 'incubating'].includes(brood.status) && totalDays && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Jour {daysInIncubation}</span>
                      <span>{daysUntilHatch !== null && daysUntilHatch > 0 ? `J-${daysUntilHatch}` : daysUntilHatch === 0 ? '🐣 Aujourd\'hui !' : '⏰ En retard'}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {['TERMINEE', 'hatched'].includes(brood.status) && successRate !== null && (
                  <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-xs text-green-700 dark:text-green-400 font-medium flex justify-between">
                    <span>🐣 {brood.hatchedCount} / {brood.eggCount} éclos</span>
                    <span>{successRate}% de réussite</span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {(brood.events?.length || 0)} événement(s)
                  </span>
                  <span className="text-xs text-forest-600 font-medium">Voir le détail →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-border dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-foreground dark:text-white">🥚 Nouvelle couvée</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Espèce *</label>
                  <select
                    value={form.speciesId}
                    onChange={e => setForm(p => ({ ...p, speciesId: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                  >
                    <option value="">Sélectionner une espèce</option>
                    {(species || []).map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Nombre d'œufs *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.eggCount}
                    onChange={e => setForm(p => ({ ...p, eggCount: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Incubateur</label>
                  <input
                    type="text"
                    value={form.incubatorId}
                    onChange={e => setForm(p => ({ ...p, incubatorId: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                    placeholder="Incubateur A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Début incubation *</label>
                  <input
                    type="date"
                    value={form.incubationStartDate}
                    onChange={e => setForm(p => ({ ...p, incubationStartDate: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Éclosion prévue</label>
                  <input
                    type="date"
                    value={form.expectedHatchDate}
                    onChange={e => setForm(p => ({ ...p, expectedHatchDate: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Température (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.temperature}
                    onChange={e => setForm(p => ({ ...p, temperature: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                    placeholder="37.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Humidité (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={form.humidity}
                    onChange={e => setForm(p => ({ ...p, humidity: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                    placeholder="60"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground dark:text-white"
                    placeholder="Observations..."
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-border dark:border-gray-700">
              <button
                onClick={() => createMutation.mutate({
                  speciesId: form.speciesId,
                  eggCount: parseInt(form.eggCount),
                  incubationStartDate: form.incubationStartDate,
                  expectedHatchDate: form.expectedHatchDate || undefined,
                  temperature: form.temperature ? parseFloat(form.temperature) : undefined,
                  humidity: form.humidity ? parseFloat(form.humidity) : undefined,
                  incubatorId: form.incubatorId || undefined,
                  notes: form.notes || undefined,
                })}
                disabled={!form.speciesId || !form.eggCount || createMutation.isPending}
                className="flex-1 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? 'Création...' : 'Créer la couvée'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-50 dark:bg-muted/20 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
