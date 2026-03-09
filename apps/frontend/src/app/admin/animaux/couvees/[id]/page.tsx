'use client';
import { toast } from 'sonner';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  INCUBATION: '#3b82f6',
  ECLOSION: '#f59e0b',
  TERMINEE: '#22c55e',
  ECHEC: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  INCUBATION: 'En incubation',
  ECLOSION: 'Éclosion en cours',
  TERMINEE: 'Terminée',
  ECHEC: 'Échec',
};

const EVENT_ICONS: Record<string, string> = {
  CANDLING: '🕯️',
  TURNING: '🔄',
  TEMPERATURE_CHECK: '🌡️',
  HATCHING: '🐣',
  NOTE: '📝',
};

export default function BroodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'stats'>('overview');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ type: 'NOTE', notes: '', temperature: '', humidity: '' });

  const { data: brood, isLoading }, isError = useQuery({
    queryKey: ['brood', id],
    queryFn: () => api.get(`/plugins/animaux/broods/${id}`).then(r => r.data),
  });

  const addEventMutation = useMutation({
    mutationFn: (data: any) => api.post(`/plugins/animaux/broods/${id}/events`, data),
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['brood', id] });
      setShowAddEvent(false);
      setNewEvent({ type: 'NOTE', notes: '', temperature: '', humidity: '' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => api.put(`/plugins/animaux/broods/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brood', id] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-600" />
      </div>
    );
  }

  if (!brood) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Couvée introuvable</p>
        <button onClick={() => router.back()} className="mt-4 text-forest-600 hover:underline">← Retour</button>
      </div>
    );
  }

  // Données pour les graphiques
  const eggData = [
    { name: 'Éclos', value: brood.hatchedCount || 0, color: '#22c55e' },
    { name: 'Morts', value: brood.deadCount || 0, color: '#ef4444' },
    { name: 'Restants', value: Math.max(0, (brood.fertilizedCount || brood.eggCount) - (brood.hatchedCount || 0) - (brood.deadCount || 0)), color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const successRate = brood.eggCount > 0
    ? Math.round(((brood.hatchedCount || 0) / brood.eggCount) * 100)
    : 0;

  // Données de température sur les 7 derniers événements
  const tempData = (brood.events || [])
    .filter((e: any) => e.type === 'TEMPERATURE_CHECK' && e.data?.temperature)
    .slice(-10)
    .map((e: any, i: number) => ({
      day: `J${i + 1}`,
      temperature: e.data.temperature,
      humidity: e.data.humidity,
    }));

  const daysIncubating = brood.incubationStartDate
    ? Math.floor((Date.now() - new Date(brood.incubationStartDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const progressPercent = brood.expectedHatchDate && brood.incubationStartDate
    ? Math.min(100, Math.round(
        (daysIncubating /
          Math.floor((new Date(brood.expectedHatchDate).getTime() - new Date(brood.incubationStartDate).getTime()) / (1000 * 60 * 60 * 24))
        ) * 100
      ))
    : 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ←
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🥚</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Couvée {brood.reference || `#${id.slice(-6)}`}
                </h1>
                <p className="text-gray-500">{brood.species?.name} — {brood.eggCount} œufs</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: `${STATUS_COLORS[brood.status]}20`,
              color: STATUS_COLORS[brood.status],
            }}
          >
            {STATUS_LABELS[brood.status] || brood.status}
          </span>
          {brood.status === 'INCUBATION' && (
            <div className="flex gap-2">
              <button
                onClick={() => updateStatusMutation.mutate('ECLOSION')}
                className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors"
              >
                🐣 Début éclosion
              </button>
              <button
                onClick={() => updateStatusMutation.mutate('TERMINEE')}
                className="px-3 py-1.5 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 transition-colors"
              >
                ✓ Terminer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Œufs total', value: brood.eggCount, icon: '🥚', color: 'blue' },
          { label: 'Fertilisés', value: brood.fertilizedCount ?? '—', icon: '🔬', color: 'purple' },
          { label: 'Éclos', value: brood.hatchedCount ?? 0, icon: '🐣', color: 'green' },
          { label: 'Taux de réussite', value: `${successRate}%`, icon: '📊', color: 'amber' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Barre de progression */}
      {brood.status === 'INCUBATION' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progression de l'incubation — Jour {daysIncubating}
            </span>
            <span className="text-sm font-bold text-forest-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-forest-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Début : {brood.incubationStartDate ? new Date(brood.incubationStartDate).toLocaleDateString('fr-FR') : '—'}</span>
            <span>Éclosion prévue : {brood.expectedHatchDate ? new Date(brood.expectedHatchDate).toLocaleDateString('fr-FR') : '—'}</span>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1">
          {(['overview', 'events', 'stats'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-800 border border-b-white dark:border-gray-700 dark:border-b-gray-800 text-forest-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'overview' ? '📋 Fiche' : tab === 'events' ? '📅 Événements' : '📊 Statistiques'}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Informations générales</h3>
            <dl className="space-y-3">
              {[
                { label: 'Espèce', value: brood.species?.name },
                { label: 'Référence', value: brood.reference || '—' },
                { label: 'Incubateur', value: brood.incubatorId || '—' },
                { label: 'Température cible', value: brood.temperature ? `${brood.temperature}°C` : '—' },
                { label: 'Humidité cible', value: brood.humidity ? `${brood.humidity}%` : '—' },
                { label: 'Début incubation', value: brood.incubationStartDate ? new Date(brood.incubationStartDate).toLocaleDateString('fr-FR') : '—' },
                { label: 'Éclosion prévue', value: brood.expectedHatchDate ? new Date(brood.expectedHatchDate).toLocaleDateString('fr-FR') : '—' },
                { label: 'Éclosion réelle', value: brood.hatchDate ? new Date(brood.hatchDate).toLocaleDateString('fr-FR') : '—' },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <dt className="text-sm text-gray-500">{item.label}</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{item.value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Répartition des œufs</h3>
            {eggData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={eggData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {eggData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <p>Données insuffisantes</p>
              </div>
            )}
          </div>

          {brood.notes && (
            <div className="md:col-span-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">📝 Notes</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">{brood.notes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Historique des événements ({brood.events?.length || 0})
            </h3>
            <button
              onClick={() => setShowAddEvent(true)}
              className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 transition-colors"
            >
              + Ajouter un événement
            </button>
          </div>

          {showAddEvent && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Nouvel événement</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {Object.entries(EVENT_ICONS).map(([key, icon]) => (
                      <option key={key} value={key}>{icon} {key}</option>
                    ))}
                  </select>
                </div>
                {(newEvent.type === 'TEMPERATURE_CHECK') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Température (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newEvent.temperature}
                        onChange={e => setNewEvent(p => ({ ...p, temperature: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="37.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Humidité (%)</label>
                      <input
                        type="number"
                        step="1"
                        value={newEvent.humidity}
                        onChange={e => setNewEvent(p => ({ ...p, humidity: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="60"
                      />
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={newEvent.notes}
                    onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Observations..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => addEventMutation.mutate({
                    type: newEvent.type,
                    notes: newEvent.notes,
                    data: newEvent.temperature ? {
                      temperature: parseFloat(newEvent.temperature),
                      humidity: newEvent.humidity ? parseFloat(newEvent.humidity) : undefined,
                    } : undefined,
                  })}
                  disabled={addEventMutation.isPending}
                  className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 disabled:opacity-50 transition-colors"
                >
                  {addEventMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-4">
              {(brood.events || []).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-2">📅</p>
                  <p>Aucun événement enregistré</p>
                </div>
              ) : (
                (brood.events || []).map((event: any, index: number) => (
                  <div key={event.id || index} className="relative flex gap-4 pl-12">
                    <div className="absolute left-3.5 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-forest-500 flex items-center justify-center text-xs">
                      {EVENT_ICONS[event.type] || '📌'}
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {EVENT_ICONS[event.type]} {event.type}
                          </span>
                          {event.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.notes}</p>
                          )}
                          {event.data?.temperature && (
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span>🌡️ {event.data.temperature}°C</span>
                              {event.data.humidity && <span>💧 {event.data.humidity}%</span>}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                          {new Date(event.timestamp).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graphique température */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Évolution température & humidité</h3>
            {tempData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={tempData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="temp" domain={[30, 45]} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="hum" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#ef4444" name="Temp (°C)" dot={{ r: 3 }} />
                  <Line yAxisId="hum" type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidité (%)" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <p>Aucune donnée de température</p>
              </div>
            )}
          </div>

          {/* Graphique résultats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Résultats de la couvée</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { name: 'Œufs', total: brood.eggCount, fertilisés: brood.fertilizedCount || 0, éclos: brood.hatchedCount || 0, morts: brood.deadCount || 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#94a3b8" name="Total" />
                <Bar dataKey="fertilisés" fill="#a78bfa" name="Fertilisés" />
                <Bar dataKey="éclos" fill="#22c55e" name="Éclos" />
                <Bar dataKey="morts" fill="#ef4444" name="Morts" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Statistiques textuelles */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Indicateurs de performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Taux de fertilisation',
                  value: brood.fertilizedCount && brood.eggCount
                    ? `${Math.round((brood.fertilizedCount / brood.eggCount) * 100)}%`
                    : '—',
                  color: 'purple',
                },
                {
                  label: 'Taux d\'éclosion',
                  value: `${successRate}%`,
                  color: successRate >= 70 ? 'green' : successRate >= 40 ? 'amber' : 'red',
                },
                {
                  label: 'Mortalité',
                  value: brood.eggCount > 0 && brood.deadCount
                    ? `${Math.round((brood.deadCount / brood.eggCount) * 100)}%`
                    : '0%',
                  color: 'red',
                },
                {
                  label: 'Durée incubation',
                  value: `${daysIncubating} jours`,
                  color: 'blue',
                },
              ].map(stat => (
                <div key={stat.label} className={`p-4 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 border border-${stat.color}-200 dark:border-${stat.color}-700`}>
                  <div className={`text-2xl font-bold text-${stat.color}-700 dark:text-${stat.color}-400`}>{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
