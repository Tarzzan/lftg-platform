'use client';

import { useState } from 'react';

const mockAlerts = [
  {
    id: 'alert-001',
    severity: 'critical',
    type: 'stock_low',
    title: 'Stock critique — Graines de tournesol',
    message: 'Le stock de graines de tournesol est à 2 kg, en dessous du seuil critique de 5 kg.',
    entityName: 'Graines de tournesol',
    entityType: 'article',
    value: 2,
    threshold: 5,
    unit: 'kg',
    triggeredAt: '2026-03-01T10:00:00Z',
    acknowledged: false,
    resolved: false,
  },
  {
    id: 'alert-002',
    severity: 'critical',
    type: 'animal_health',
    title: 'Animal malade — Ara Macao #AM-042',
    message: "L'Ara Macao AM-042 présente des symptômes respiratoires. Consultation vétérinaire urgente requise.",
    entityName: 'Ara Macao AM-042',
    entityType: 'animal',
    value: 0,
    threshold: 0,
    unit: '',
    triggeredAt: '2026-03-01T11:15:00Z',
    acknowledged: false,
    resolved: false,
  },
  {
    id: 'alert-003',
    severity: 'warning',
    type: 'cites_expiry',
    title: 'Permis CITES expirant — Dendrobates azureus',
    message: 'Le permis CITES pour les Dendrobates azureus expire dans 18 jours (19 Mars 2026).',
    entityName: 'Permis Dendrobates azureus',
    entityType: 'cites_permit',
    value: 18,
    threshold: 30,
    unit: 'jours',
    triggeredAt: '2026-02-28T09:00:00Z',
    acknowledged: true,
    resolved: false,
  },
  {
    id: 'alert-004',
    severity: 'warning',
    type: 'temperature',
    title: 'Température élevée — Serre Reptiles',
    message: 'La température dans la serre Reptiles a atteint 38°C, dépassant le seuil de 35°C.',
    entityName: 'Serre Reptiles',
    entityType: 'enclos',
    value: 38,
    threshold: 35,
    unit: '°C',
    triggeredAt: '2026-03-01T08:30:00Z',
    acknowledged: true,
    resolved: true,
  },
  {
    id: 'alert-005',
    severity: 'info',
    type: 'hatching',
    title: 'Éclosion imminente — Couvée #COV-2026-08',
    message: "La couvée COV-2026-08 (Amazone à front bleu) devrait éclore dans 2 jours.",
    entityName: 'Couvée Amazone #COV-2026-08',
    entityType: 'couvee',
    value: 2,
    threshold: 3,
    unit: 'jours',
    triggeredAt: '2026-03-01T06:00:00Z',
    acknowledged: false,
    resolved: false,
  },
  {
    id: 'alert-006',
    severity: 'warning',
    type: 'stock_low',
    title: 'Stock faible — Vitamines A+D3',
    message: 'Le stock de Vitamines A+D3 est à 3 flacons, en dessous du seuil de 5.',
    entityName: 'Vitamines A+D3',
    entityType: 'article',
    value: 3,
    threshold: 5,
    unit: 'flacons',
    triggeredAt: '2026-02-29T14:00:00Z',
    acknowledged: false,
    resolved: false,
  },
];

const rules = [
  { id: 'rule-1', name: 'Stock critique', type: 'stock_low', severity: 'critical', enabled: true, triggered: 2 },
  { id: 'rule-2', name: 'Animal malade', type: 'animal_health', severity: 'critical', enabled: true, triggered: 1 },
  { id: 'rule-3', name: 'Permis CITES expirant', type: 'cites_expiry', severity: 'warning', enabled: true, triggered: 1 },
  { id: 'rule-4', name: 'Température élevée', type: 'temperature', severity: 'warning', enabled: true, triggered: 1 },
  { id: 'rule-5', name: 'Éclosion imminente', type: 'hatching', severity: 'info', enabled: true, triggered: 1 },
  { id: 'rule-6', name: 'Batterie GPS faible', type: 'gps_battery', severity: 'warning', enabled: true, triggered: 1 },
];

const severityConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  critical: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Critique', icon: '🔴' },
  warning: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Avertissement', icon: '🟡' },
  info: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Information', icon: '🔵' },
};

const typeLabels: Record<string, string> = {
  stock_low: '📦 Stock',
  animal_health: '🐾 Santé',
  cites_expiry: '📋 CITES',
  temperature: '🌡️ Température',
  hatching: '🥚 Couvée',
  gps_battery: '📡 GPS',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `il y a ${h}h${m > 0 ? m + 'min' : ''}`;
  return `il y a ${m}min`;
}

export default function AlertesPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState<'all' | 'active' | 'critical' | 'warning' | 'info'>('all');
  const [tab, setTab] = useState<'alerts' | 'rules'>('alerts');

  const filtered = alerts.filter(a => {
    if (filter === 'active') return !a.resolved;
    if (filter === 'critical') return a.severity === 'critical' && !a.resolved;
    if (filter === 'warning') return a.severity === 'warning' && !a.resolved;
    if (filter === 'info') return a.severity === 'info';
    return true;
  });

  const stats = {
    total: alerts.filter(a => !a.resolved).length,
    critical: alerts.filter(a => a.severity === 'critical' && !a.resolved).length,
    warning: alerts.filter(a => a.severity === 'warning' && !a.resolved).length,
    info: alerts.filter(a => a.severity === 'info').length,
    unack: alerts.filter(a => !a.acknowledged && !a.resolved).length,
  };

  const acknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const resolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centre d'Alertes</h1>
          <p className="text-sm text-gray-500 mt-1">Surveillance intelligente en temps réel</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 text-sm font-medium">
          ⚙️ Configurer les règles
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Alertes actives', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Critiques', value: stats.critical, color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Avertissements', value: stats.warning, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Informations', value: stats.info, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Non acquittées', value: stats.unack, color: 'text-purple-700', bg: 'bg-purple-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['alerts', 'rules'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'alerts' ? `🔔 Alertes (${stats.total})` : '⚙️ Règles'}
          </button>
        ))}
      </div>

      {tab === 'alerts' && (
        <>
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'critical', 'warning', 'info'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filter === f
                    ? 'bg-forest-600 text-white border-forest-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-forest-400'
                }`}
              >
                {f === 'all' ? 'Toutes' : f === 'active' ? 'Actives' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Alert list */}
          <div className="space-y-3">
            {filtered.map(alert => {
              const cfg = severityConfig[alert.severity];
              return (
                <div
                  key={alert.id}
                  className={`border rounded-xl p-4 ${cfg.bg} ${alert.resolved ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-xl mt-0.5">{cfg.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-sm ${cfg.color}`}>{alert.title}</span>
                          <span className="text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-600">
                            {typeLabels[alert.type] || alert.type}
                          </span>
                          {alert.acknowledged && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Acquittée</span>
                          )}
                          {alert.resolved && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">✓ Résolue</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>🕐 {timeAgo(alert.triggeredAt)}</span>
                          {alert.unit && (
                            <span>
                              Valeur : <strong>{alert.value} {alert.unit}</strong> / Seuil : {alert.threshold} {alert.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <div className="flex gap-2 shrink-0">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => acknowledge(alert.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            Acquitter
                          </button>
                        )}
                        <button
                          onClick={() => resolve(alert.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700"
                        >
                          Résoudre
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-medium">Aucune alerte dans cette catégorie</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'rules' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Règle</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Sévérité</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Déclenchements</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{rule.name}</td>
                  <td className="px-4 py-3 text-gray-500">{typeLabels[rule.type] || rule.type}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      rule.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      rule.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {severityConfig[rule.severity]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{rule.triggered} ce mois</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {rule.enabled ? '● Actif' : '○ Désactivé'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
