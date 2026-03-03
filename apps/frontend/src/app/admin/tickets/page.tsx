'use client';

import { useState } from 'react';

const TICKETS = [
  {
    id: 'ticket-1',
    reference: 'TKT-2026-001',
    title: 'Fuite dans l\'enclos des reptiles',
    description: 'Une fuite d\'eau a été détectée dans le système de brumisation de l\'enclos reptilarium.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    category: 'INFRASTRUCTURE',
    createdBy: 'Marie Dupont',
    assignee: 'Jean Martin',
    location: 'Reptilarium',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toLocaleDateString('fr-FR'),
    createdAt: '6h',
    comments: 1,
  },
  {
    id: 'ticket-2',
    reference: 'TKT-2026-002',
    title: 'Ara Bleu — comportement anormal',
    description: 'L\'Ara Bleu (E-03) présente des signes d\'agitation inhabituelle depuis ce matin.',
    status: 'OPEN',
    priority: 'CRITICAL',
    category: 'MEDICAL',
    createdBy: 'Marie Dupont',
    assignee: 'Dr. Rousseau',
    location: 'Animal E-03',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 4).toLocaleDateString('fr-FR'),
    createdAt: '1h',
    comments: 0,
  },
  {
    id: 'ticket-3',
    reference: 'TKT-2026-003',
    title: 'Stock graines tournesol épuisé',
    description: 'Le stock de graines de tournesol est épuisé. Commande urgente nécessaire.',
    status: 'RESOLVED',
    priority: 'HIGH',
    category: 'STOCK',
    createdBy: 'Jean Martin',
    assignee: 'William MERI',
    location: 'Entrepôt',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toLocaleDateString('fr-FR'),
    createdAt: '2j',
    comments: 2,
  },
  {
    id: 'ticket-4',
    reference: 'TKT-2026-004',
    title: 'Serrure enclos Volière A défectueuse',
    description: 'La serrure de sécurité de la Volière A ne se ferme plus correctement. Risque d\'évasion.',
    status: 'OPEN',
    priority: 'CRITICAL',
    category: 'SECURITY',
    createdBy: 'Sophie Bernard',
    assignee: 'Jean Martin',
    location: 'Volière A',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2).toLocaleDateString('fr-FR'),
    createdAt: '30min',
    comments: 0,
  },
  {
    id: 'ticket-5',
    reference: 'TKT-2026-005',
    title: 'Lampe UV reptilarium à remplacer',
    description: 'La lampe UV de l\'enclos reptilarium est grillée.',
    status: 'CLOSED',
    priority: 'MEDIUM',
    category: 'EQUIPMENT',
    createdBy: 'Dr. Rousseau',
    assignee: 'Jean Martin',
    location: 'Reptilarium',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toLocaleDateString('fr-FR'),
    createdAt: '3j',
    comments: 1,
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OPEN: { label: 'Ouvert', color: 'text-blue-700', bg: 'bg-blue-100' },
  IN_PROGRESS: { label: 'En cours', color: 'text-amber-700', bg: 'bg-amber-100' },
  RESOLVED: { label: 'Résolu', color: 'text-green-700', bg: 'bg-green-100' },
  CLOSED: { label: 'Fermé', color: 'text-gray-600', bg: 'bg-gray-100' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  LOW: { label: 'Faible', color: 'text-gray-500', dot: 'bg-gray-400' },
  MEDIUM: { label: 'Moyen', color: 'text-blue-600', dot: 'bg-blue-500' },
  HIGH: { label: 'Élevé', color: 'text-amber-600', dot: 'bg-amber-500' },
  CRITICAL: { label: 'Critique', color: 'text-red-600', dot: 'bg-red-500' },
};

const CATEGORY_ICONS: Record<string, string> = {
  MEDICAL: '🏥',
  EQUIPMENT: '🔧',
  SECURITY: '🔒',
  STOCK: '📦',
  ANIMAL: '🦜',
  INFRASTRUCTURE: '🏗️',
  OTHER: '📝',
};

export default function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState<typeof TICKETS[0] | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newComment, setNewComment] = useState('');

  const stats = {
    total: TICKETS.length,
    open: TICKETS.filter(t => t.status === 'OPEN').length,
    inProgress: TICKETS.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: TICKETS.filter(t => t.status === 'RESOLVED').length,
    critical: TICKETS.filter(t => t.priority === 'CRITICAL').length,
  };

  const filtered = TICKETS.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wood-900">Tickets & Incidents</h1>
          <p className="text-sm text-wood-500 mt-1">Suivi des incidents, pannes et demandes d'intervention</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm px-4 py-2">
          + Nouveau ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-wood-700', bg: 'bg-wood-50', filter: 'ALL' },
          { label: 'Ouverts', value: stats.open, color: 'text-blue-700', bg: 'bg-blue-50', filter: 'OPEN' },
          { label: 'En cours', value: stats.inProgress, color: 'text-amber-700', bg: 'bg-amber-50', filter: 'IN_PROGRESS' },
          { label: 'Résolus', value: stats.resolved, color: 'text-green-700', bg: 'bg-green-50', filter: 'RESOLVED' },
          { label: 'Critiques', value: stats.critical, color: 'text-red-700', bg: 'bg-red-50', filter: 'CRITICAL_FILTER' },
        ].map((stat, i) => (
          <button
            key={i}
            onClick={() => stat.filter !== 'CRITICAL_FILTER' && setStatusFilter(stat.filter)}
            className={`${stat.bg} rounded-xl p-4 text-center transition-all hover:shadow-md ${statusFilter === stat.filter ? 'ring-2 ring-forest-500' : ''}`}
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-wood-500 mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-wood-100 rounded-lg p-1">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${statusFilter === s ? 'bg-white text-forest-700 font-semibold shadow-sm' : 'text-wood-600'}`}
            >
              {s === 'ALL' ? 'Tous' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
        <div className="flex bg-wood-100 rounded-lg p-1">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${priorityFilter === p ? 'bg-white text-forest-700 font-semibold shadow-sm' : 'text-wood-600'}`}
            >
              {p === 'ALL' ? 'Toutes priorités' : PRIORITY_CONFIG[p]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets list */}
      <div className="space-y-3">
        {filtered.map(ticket => {
          const status = STATUS_CONFIG[ticket.status];
          const priority = PRIORITY_CONFIG[ticket.priority];
          return (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`card p-5 cursor-pointer hover:shadow-md transition-all ${ticket.priority === 'CRITICAL' && ticket.status === 'OPEN' ? 'border-l-4 border-l-red-500' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="text-2xl flex-shrink-0 mt-0.5">{CATEGORY_ICONS[ticket.category]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-wood-400">{ticket.reference}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${priority.dot}`} />
                        <span className={`text-xs font-semibold ${priority.color}`}>{priority.label}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-wood-900 mb-1">{ticket.title}</h3>
                    <p className="text-sm text-wood-500 truncate">{ticket.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-wood-400">
                      <span>📍 {ticket.location}</span>
                      <span>👤 {ticket.assignee}</span>
                      <span>💬 {ticket.comments} commentaire{ticket.comments !== 1 ? 's' : ''}</span>
                      <span>🕐 Il y a {ticket.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-wood-400">Échéance</p>
                  <p className={`text-sm font-semibold ${new Date(ticket.dueDate) < new Date() ? 'text-red-600' : 'text-wood-700'}`}>
                    {ticket.dueDate}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket detail modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-wood-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-wood-400">{selectedTicket.reference}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_CONFIG[selectedTicket.status].bg} ${STATUS_CONFIG[selectedTicket.status].color}`}>
                      {STATUS_CONFIG[selectedTicket.status].label}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[selectedTicket.priority].dot}`} />
                      <span className={`text-xs font-semibold ${PRIORITY_CONFIG[selectedTicket.priority].color}`}>
                        {PRIORITY_CONFIG[selectedTicket.priority].label}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-wood-900">{selectedTicket.title}</h2>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="text-wood-400 hover:text-wood-600 text-2xl">×</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-wood-600">{selectedTicket.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-wood-400">Catégorie</span><p className="font-semibold text-wood-800">{CATEGORY_ICONS[selectedTicket.category]} {selectedTicket.category}</p></div>
                <div><span className="text-wood-400">Lieu</span><p className="font-semibold text-wood-800">{selectedTicket.location}</p></div>
                <div><span className="text-wood-400">Créé par</span><p className="font-semibold text-wood-800">{selectedTicket.createdBy}</p></div>
                <div><span className="text-wood-400">Assigné à</span><p className="font-semibold text-wood-800">{selectedTicket.assignee}</p></div>
                <div><span className="text-wood-400">Créé il y a</span><p className="font-semibold text-wood-800">{selectedTicket.createdAt}</p></div>
                <div><span className="text-wood-400">Échéance</span><p className="font-semibold text-wood-800">{selectedTicket.dueDate}</p></div>
              </div>

              <div className="border-t border-wood-100 pt-4">
                <h3 className="font-semibold text-wood-700 mb-3">Changer le statut</h3>
                <div className="flex gap-2 flex-wrap">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
                    <button
                      key={s}
                      className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${selectedTicket.status === s ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} ring-2 ring-offset-1 ring-forest-400` : 'bg-wood-100 text-wood-600 hover:bg-wood-200'}`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-wood-100 pt-4">
                <h3 className="font-semibold text-wood-700 mb-3">Ajouter un commentaire</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Votre commentaire..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                  <button className="btn-primary text-sm px-4 py-2">Envoyer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create ticket modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-wood-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-wood-900">Nouveau ticket</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-wood-400 hover:text-wood-600 text-2xl">×</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1">Titre *</label>
                <input type="text" placeholder="Titre du ticket..." className="w-full px-3 py-2 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1">Description</label>
                <textarea rows={3} placeholder="Décrivez le problème..." className="w-full px-3 py-2 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-1">Priorité</label>
                  <select className="w-full px-3 py-2 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500">
                    <option value="LOW">Faible</option>
                    <option value="MEDIUM">Moyen</option>
                    <option value="HIGH">Élevé</option>
                    <option value="CRITICAL">Critique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-1">Catégorie</label>
                  <select className="w-full px-3 py-2 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500">
                    <option value="MEDICAL">Médical</option>
                    <option value="EQUIPMENT">Équipement</option>
                    <option value="SECURITY">Sécurité</option>
                    <option value="STOCK">Stock</option>
                    <option value="ANIMAL">Animal</option>
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 text-sm border border-wood-200 rounded-lg text-wood-600 hover:bg-wood-50">Annuler</button>
                <button className="flex-1 btn-primary text-sm py-2">Créer le ticket</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
