'use client';
import { useState } from 'react';

const CONGES = [
  { id: 'leave-001', employe: 'Marie Dupont', avatar: '👩‍🔬', type: 'Congés payés', dateDebut: '07/04/2026', dateFin: '18/04/2026', jours: 10, motif: 'Vacances Pâques', statut: 'Approuvé', approbateur: 'William MERI' },
  { id: 'leave-002', employe: 'Jean Martin', avatar: '📦', type: 'RTT', dateDebut: '15/03/2026', dateFin: '15/03/2026', jours: 1, motif: '', statut: 'En attente', approbateur: '' },
  { id: 'leave-003', employe: 'Sophie Bernard', avatar: '👩‍🎓', type: 'Formation', dateDebut: '20/03/2026', dateFin: '22/03/2026', jours: 3, motif: 'Formation premiers secours animaux', statut: 'Approuvé', approbateur: 'William MERI' },
  { id: 'leave-004', employe: 'Dr. Rousseau', avatar: '👨‍⚕️', type: 'Congés payés', dateDebut: '04/05/2026', dateFin: '08/05/2026', jours: 5, motif: 'Congé annuel', statut: 'En attente', approbateur: '' },
  { id: 'leave-005', employe: 'Marie Dupont', avatar: '👩‍🔬', type: 'Maladie', dateDebut: '03/11/2025', dateFin: '04/11/2025', jours: 2, motif: '', statut: 'Approuvé', approbateur: 'William MERI' },
];

const TYPE_COLORS: Record<string, string> = {
  'Congés payés': 'bg-green-100 text-green-700',
  RTT: 'bg-blue-100 text-blue-700',
  Formation: 'bg-purple-100 text-purple-700',
  Maladie: 'bg-red-100 text-red-700',
  Maternité: 'bg-pink-100 text-pink-700',
};

const STATUT_COLORS: Record<string, string> = {
  Approuvé: 'bg-green-100 text-green-700',
  'En attente': 'bg-yellow-100 text-yellow-700',
  Refusé: 'bg-red-100 text-red-700',
  Annulé: 'bg-gray-100 text-gray-500',
};

export default function CongesPage() {
  const [filterStatut, setFilterStatut] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [conges, setConges] = useState(CONGES);

  const filtered = conges.filter(c => {
    const matchStatut = !filterStatut || c.statut === filterStatut;
    const matchType = !filterType || c.type === filterType;
    return matchStatut && matchType;
  });

  const approve = (id: string) => setConges(prev => prev.map(c => c.id === id ? { ...c, statut: 'Approuvé', approbateur: 'William MERI' } : c));
  const refuse = (id: string) => setConges(prev => prev.map(c => c.id === id ? { ...c, statut: 'Refusé' } : c));

  const enAttente = conges.filter(c => c.statut === 'En attente').length;
  const approuves = conges.filter(c => c.statut === 'Approuvé').length;
  const joursTotal = conges.filter(c => c.statut === 'Approuvé').reduce((sum, c) => sum + c.jours, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des congés</h1>
          <p className="text-sm text-gray-500 mt-1">Suivi des demandes et absences du personnel</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors text-sm font-medium"
        >
          + Nouvelle demande
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'En attente', value: enAttente, icon: '⏳', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Approuvés', value: approuves, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Jours approuvés', value: `${joursTotal}j`, icon: '📅', color: 'text-forest-600', bg: 'bg-forest-50' },
          { label: 'Total demandes', value: conges.length, icon: '📋', color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(kpi => (
          <div key={kpi.label} className={`${kpi.bg} rounded-xl border border-gray-200 p-4`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{kpi.icon}</span>
              <div>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-xs text-gray-500">{kpi.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertes en attente */}
      {enAttente > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <span>⚠️</span>
            <span className="text-sm font-medium">{enAttente} demande{enAttente > 1 ? 's' : ''} en attente d'approbation</span>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="Approuvé">Approuvé</option>
            <option value="Refusé">Refusé</option>
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="">Tous les types</option>
            <option value="Congés payés">Congés payés</option>
            <option value="RTT">RTT</option>
            <option value="Formation">Formation</option>
            <option value="Maladie">Maladie</option>
          </select>
        </div>
      </div>

      {/* Tableau des demandes */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.map(c => (
            <div key={c.id} className={`p-4 hover:bg-gray-50 transition-colors ${c.statut === 'En attente' ? 'border-l-4 border-yellow-400' : ''}`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl">{c.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{c.employe}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[c.type] || 'bg-gray-100 text-gray-700'}`}>
                      {c.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_COLORS[c.statut]}`}>
                      {c.statut}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {c.dateDebut} → {c.dateFin} · <strong>{c.jours} jour{c.jours > 1 ? 's' : ''}</strong>
                    {c.motif && ` · ${c.motif}`}
                  </div>
                  {c.approbateur && (
                    <div className="text-xs text-gray-400 mt-0.5">Approuvé par {c.approbateur}</div>
                  )}
                </div>
                {c.statut === 'En attente' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => approve(c.id)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      ✓ Approuver
                    </button>
                    <button
                      onClick={() => refuse(c.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                    >
                      ✗ Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-sm">Aucune demande trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal nouvelle demande */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Nouvelle demande de congé</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employé</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option>Marie Dupont</option>
                  <option>Dr. Rousseau</option>
                  <option>Jean Martin</option>
                  <option>Sophie Bernard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type de congé</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option>Congés payés</option>
                  <option>RTT</option>
                  <option>Formation</option>
                  <option>Maladie</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date début</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date fin</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Motif (optionnel)</label>
                <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" rows={2} placeholder="Motif de la demande..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                Annuler
              </button>
              <button className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700">
                Soumettre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
