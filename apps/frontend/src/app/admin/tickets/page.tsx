'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Ticket {
  id: string;
  reference: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdById: string;
  assigneeId?: string;
  animalId?: string;
  createdAt?: string;
  updatedAt?: string;
}

const statusConfig = {
  OPEN: { label: 'Ouvert', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-700' },
  IN_PROGRESS: { label: 'En cours', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700' },
  RESOLVED: { label: 'Résolu', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700' },
  CLOSED: { label: 'Fermé', color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' },
};

const priorityConfig = {
  low: { label: 'Faible', color: 'text-slate-400' },
  medium: { label: 'Normale', color: 'text-blue-400' },
  high: { label: 'Haute', color: 'text-orange-400' },
  urgent: { label: 'Urgente', color: 'text-red-400' },
};

export default function TicketsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'medium', category: 'GENERAL' });

  const { data: rawTickets, isLoading, isError } = useQuery({
    queryKey: ['tickets', statusFilter],
    queryFn: async () => {
      const res = await api.get('/tickets');
      return res.data;
    },
  });

  // L'API peut retourner un objet ou un tableau
  const tickets: Ticket[] = Array.isArray(rawTickets)
    ? rawTickets
    : rawTickets && typeof rawTickets ==='object'? Object.values(rawTickets).flat() as Ticket[]
    : [];

  const filteredTickets = statusFilter ==='all'? tickets : tickets.filter((t) => t.status === statusFilter);

  const createMutation = useMutation({
    mutationFn: async (data: typeof newTicket) => {
      const res = await api.post('/tickets', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setShowCreate(false);
      setNewTicket({ title:'', description:'', priority:'medium', category:'GENERAL'});
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/tickets/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });

  const countByStatus = (s: string) => tickets.filter((t) => t.status === s).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tickets & Support</h1>
          <p className="text-slate-400 mt-1">Gestion des demandes et incidents</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
          + Nouveau ticket
        </button>
      </div>

      {/* Formulaire création */}
      {showCreate && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
          <h2 className="text-white font-semibold">Créer un ticket</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-1">Titre *</label>
              <input
                type="text"value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"placeholder="Titre du ticket"/>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Priorité</label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value="low">Faible</option>
                <option value="medium">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm block mb-1">Description</label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 h-24 resize-none"placeholder="Description détaillée..."/>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => createMutation.mutate(newTicket)}
              disabled={!newTicket.title || createMutation.isPending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
              {createMutation.isPending ?'Création...':'Créer le ticket'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['OPEN','IN_PROGRESS','RESOLVED','CLOSED'] as const).map((s) => {
          const cfg = statusConfig[s];
          return (
            <div key={s} className={`rounded-xl p-4 border ${cfg.bg} ${cfg.border}`}>
              <p className="text-slate-400 text-sm">{cfg.label}</p>
              <p className={`text-3xl font-bold mt-1 ${cfg.color}`}>{countByStatus(s)}</p>
            </div>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[['all','Tous'], ['OPEN','Ouverts'], ['IN_PROGRESS','En cours'], ['RESOLVED','Résolus'], ['CLOSED','Fermés']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === val ?'bg-indigo-600 text-white':'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"/>
        </div>
      ) : isError ? (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 text-center text-red-400">
          Erreur lors du chargement des tickets
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3"></p>
          <p className="text-slate-300 font-semibold">Aucun ticket</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const sCfg = statusConfig[ticket.status] || statusConfig.OPEN;
            const pCfg = priorityConfig[ticket.priority] || priorityConfig.medium;
            return (
              <div key={ticket.id} className={`rounded-xl p-4 border ${sCfg.bg} ${sCfg.border}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-500 text-xs font-mono">{ticket.reference}</span>
                      <span className={`text-xs font-semibold ${sCfg.color}`}>{sCfg.label}</span>
                      <span className={`text-xs ${pCfg.color}`}>Priorité {pCfg.label}</span>
                      <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">{ticket.category}</span>
                    </div>
                    <p className="text-white font-semibold mt-1">{ticket.title}</p>
                    {ticket.description && (
                      <p className="text-slate-400 text-sm mt-0.5 line-clamp-2">{ticket.description}</p>
                    )}
                    {ticket.createdAt && (
                      <p className="text-slate-500 text-xs mt-1">
                        Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  {ticket.status !=='CLOSED'&& (
                    <div className="flex gap-2 flex-shrink-0">
                      {ticket.status ==='OPEN'&& (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: ticket.id, status:'IN_PROGRESS'})}
                          className="px-3 py-1.5 text-xs bg-yellow-800 hover:bg-yellow-700 text-yellow-300 rounded-lg transition-colors">
                          Prendre en charge
                        </button>
                      )}
                      {ticket.status ==='IN_PROGRESS'&& (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: ticket.id, status:'RESOLVED' })}
                          className="px-3 py-1.5 text-xs bg-green-800 hover:bg-green-700 text-green-300 rounded-lg transition-colors"
                        >
                          Résoudre
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
