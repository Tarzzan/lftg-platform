'use client';
import { useState } from 'react';

const scheduledReports = [
  { id: 'R001', name: 'Rapport mensuel CITES', frequency: 'Mensuel (1er du mois)', recipients: ['admin@lftg.fr', 'draaf@guyane.fr'], lastSent: '1 Fév 2026', nextSend: '1 Mar 2026', status: 'active', type: 'cites' },
  { id: 'R002', name: 'Bilan hebdomadaire soigneurs', frequency: 'Hebdomadaire (Lundi 08h00)', recipients: ['soigneur@lftg.fr', 'veterinaire@lftg.fr'], lastSent: '24 Fév 2026', nextSend: '3 Mar 2026', status: 'active', type: 'health' },
  { id: 'R003', name: 'Rapport ventes mensuel', frequency: 'Mensuel (5 du mois)', recipients: ['admin@lftg.fr'], lastSent: '5 Fév 2026', nextSend: '5 Mar 2026', status: 'active', type: 'sales' },
  { id: 'R004', name: 'Rapport IoT capteurs', frequency: 'Quotidien (06h00)', recipients: ['admin@lftg.fr', 'soigneur@lftg.fr'], lastSent: 'Hier 06:00', nextSend: 'Demain 06:00', status: 'active', type: 'iot' },
  { id: 'R005', name: 'Bilan annuel DRAAF', frequency: 'Annuel (1er Janvier)', recipients: ['admin@lftg.fr', 'draaf@guyane.fr'], lastSent: '1 Jan 2026', nextSend: '1 Jan 2027', status: 'active', type: 'annual' },
];

const history = [
  { date: '1 Mar 2026 00:00', name: 'Rapport mensuel CITES', recipients: 2, size: '1.2 MB', status: 'sent' },
  { date: '28 Fév 2026 06:00', name: 'Rapport IoT capteurs', recipients: 2, size: '0.4 MB', status: 'sent' },
  { date: '27 Fév 2026 06:00', name: 'Rapport IoT capteurs', recipients: 2, size: '0.4 MB', status: 'sent' },
  { date: '24 Fév 2026 08:00', name: 'Bilan hebdomadaire soigneurs', recipients: 2, size: '0.8 MB', status: 'sent' },
  { date: '5 Fév 2026 00:00', name: 'Rapport ventes mensuel', recipients: 1, size: '0.6 MB', status: 'sent' },
];

const typeIcons: Record<string, string> = {
  cites: '📋',
  health: '🏥',
  sales: '💰',
  iot: '📡',
  annual: '📊',
};

export default function AutoReportsPage() {
  const [tab, setTab] = useState<'scheduled' | 'history' | 'create'>('scheduled');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports Automatiques</h1>
          <p className="text-gray-500 mt-1">Génération et envoi par email — Cron jobs NestJS</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">@nestjs/schedule v6</span>
          <button onClick={() => setTab('create')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
            + Nouveau rapport
          </button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Rapports planifiés', value: '5', color: 'text-blue-600' },
          { label: 'Envois (30 jours)', value: '47', color: 'text-green-600' },
          { label: 'Destinataires uniques', value: '4', color: 'text-purple-600' },
          { label: 'Taux de livraison', value: '100%', color: 'text-orange-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['scheduled', 'history', 'create'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium ${tab === t ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'scheduled' ? 'Planifiés' : t === 'history' ? 'Historique' : 'Créer'}
            </button>
          ))}
        </div>

        {tab === 'scheduled' && (
          <div className="divide-y divide-gray-100">
            {scheduledReports.map((r) => (
              <div key={r.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{typeIcons[r.type]}</span>
                    <div>
                      <p className="font-medium text-gray-900">{r.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{r.frequency}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {r.recipients.map((email) => (
                          <span key={email} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{email}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-500">Dernier envoi : <span className="text-gray-700">{r.lastSent}</span></p>
                    <p className="text-indigo-600 font-medium mt-1">Prochain : {r.nextSend}</p>
                    <div className="flex gap-2 mt-2 justify-end">
                      <button className="text-xs text-blue-600 hover:underline">Envoyer maintenant</button>
                      <button className="text-xs text-gray-500 hover:underline">Modifier</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Date', 'Rapport', 'Destinataires', 'Taille', 'Statut'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{h.date}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{h.name}</td>
                    <td className="px-4 py-3 text-gray-600">{h.recipients}</td>
                    <td className="px-4 py-3 text-gray-500">{h.size}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">✓ Envoyé</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'create' && (
          <div className="p-6 space-y-4 max-w-lg">
            <h3 className="font-semibold text-gray-900">Nouveau rapport automatique</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du rapport</label>
              <input placeholder="Ex: Rapport mensuel CITES" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Rapport CITES</option>
                <option>Bilan santé</option>
                <option>Rapport ventes</option>
                <option>Rapport IoT</option>
                <option>Bilan annuel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence (expression cron)</label>
              <input placeholder="0 0 1 * * (1er du mois à minuit)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destinataires (séparés par virgule)</label>
              <input placeholder="admin@lftg.fr, draaf@guyane.fr" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
              Planifier le rapport
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
