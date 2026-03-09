'use client';
import { toast } from 'sonner';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, GitBranch, Clock, User, ChevronRight, CheckCircle, XCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { workflowsApi } from '@/lib/api';
import { Modal, FormField, Textarea, ModalFooter, BtnPrimary, BtnSecondary } from '@/components/ui/Modal';

const STATE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft:      { label: 'Brouillon',   color: 'bg-gray-100 text-gray-700 border-gray-200',    icon: AlertCircle },
  pending:    { label: 'En attente',  color: 'bg-gold-100 text-gold-700 border-gold-200',    icon: Clock },
  in_progress:{ label: 'En cours',   color: 'bg-maroni-100 text-maroni-700 border-maroni-200', icon: PlayCircle },
  approved:   { label: 'Approuvé',   color: 'bg-forest-100 text-forest-700 border-forest-200', icon: CheckCircle },
  rejected:   { label: 'Rejeté',     color: 'bg-red-100 text-red-700 border-red-200',        icon: XCircle },
  cancelled:  { label: 'Annulé',     color: 'bg-gray-100 text-gray-500 border-gray-200',     icon: XCircle },
  completed:  { label: 'Terminé',    color: 'bg-forest-100 text-forest-700 border-forest-200', icon: CheckCircle },
};

function StateBadge({ state }: { state: string }) {
  const cfg = STATE_CONFIG[state] ?? { label: state, color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${cfg.color}`}>
      <Icon className="w-4 h-4" />
      {cfg.label}
    </span>
  );
}

function TransitionModal({ isOpen, onClose, transition, onConfirm, loading }: {
  isOpen: boolean; onClose: () => void;
  transition: { key: string; label: string; to: string } | null;
  onConfirm: (notes: string) => void; loading: boolean;
}) {
  const [notes, setNotes] = useState('');
  if (!transition) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Confirmer : ${transition.label}`} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cette action va faire passer le workflow à l'état{' '}
          <strong>{STATE_CONFIG[transition.to]?.label ?? transition.to}</strong>.
        </p>
        <FormField label="Notes (optionnel)">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Commentaire sur cette décision..."
            rows={3}
          />
        </FormField>
        <ModalFooter>
          <BtnSecondary onClick={onClose}>Annuler</BtnSecondary>
          <BtnPrimary onClick={() => onConfirm(notes)} loading={loading}>
            Confirmer
          </BtnPrimary>
        </ModalFooter>
      </div>
    </Modal>
  );
}

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [selectedTransition, setSelectedTransition] = useState<{ key: string; label: string; to: string } | null>(null);

  const { data: instance, isLoading, error, isError } = useQuery({
    queryKey: ['workflow-instance', id],
    queryFn: () => workflowsApi.getInstance(id),
  });

  const mutation = useMutation({
    mutationFn: ({ transitionKey, notes }: { transitionKey: string; notes: string }) =>
      workflowsApi.transition(id, { transition: transitionKey, notes }),
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      qc.invalidateQueries({ queryKey: ['workflow-instance', id] });
      qc.invalidateQueries({ queryKey: ['workflow-instances'] });
      setSelectedTransition(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !instance) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Instance de workflow introuvable.</p>
        {error && <p className="text-sm text-red-500 mt-1">{(error as any)?.message ?? 'Erreur de chargement'}</p>}
        <button onClick={() => router.back()} className="mt-4 text-sm text-forest-600 hover:underline">
          ← Retour
        </button>
      </div>
    );
  }

  const definition = instance.definition;
  const transitions = definition?.transitions as Record<string, any> ?? {};
  const states = definition?.states as Record<string, any> ?? {};

  // Available transitions from current state
  const availableTransitions = Object.entries(transitions)
    .filter(([, t]) => t.from === instance.currentState || t.from === '*')
    .map(([key, t]) => ({ key, label: t.label ?? key, to: t.to }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <GitBranch className="w-4 h-4" />
            <span>{definition?.name}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-mono text-xs">{instance.entityId.slice(0, 12)}...</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Détail du workflow</h1>
        </div>
        <StateBadge state={instance.currentState} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* State machine visualization */}
          <div className="lftg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-4">États du workflow</h2>
            <div className="flex flex-wrap gap-2 items-center">
              {Object.entries(states).map(([key, state]: [string, any], idx, arr) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                    key === instance.currentState
                      ? 'bg-forest-600 text-white border-forest-600 shadow-md shadow-forest-200'
                      : STATE_CONFIG[key]?.color ?? 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {state.label ?? key}
                    {state.type === 'initial' && <span className="ml-1 text-xs opacity-70">(initial)</span>}
                    {state.type === 'final' && <span className="ml-1 text-xs opacity-70">(final)</span>}
                  </div>
                  {idx < arr.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>

          {/* Available transitions */}
          {availableTransitions.length > 0 && (
            <div className="lftg-card p-6">
              <h2 className="font-display font-semibold text-foreground mb-4">Actions disponibles</h2>
              <div className="flex flex-wrap gap-3">
                {availableTransitions.map((t) => {
                  const toConfig = STATE_CONFIG[t.to];
                  return (
                    <button
                      key={t.key}
                      onClick={() => setSelectedTransition(t)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all hover:scale-105 active:scale-95 ${
                        t.to === 'approved' || t.to === 'completed'
                          ? 'border-forest-500 bg-forest-50 text-forest-700 hover:bg-forest-100'
                          : t.to === 'rejected' || t.to === 'cancelled'
                          ? 'border-red-400 bg-red-50 text-red-700 hover:bg-red-100'
                          : 'border-maroni-400 bg-maroni-50 text-maroni-700 hover:bg-maroni-100'
                      }`}
                    >
                      {toConfig?.icon && <toConfig.icon className="w-4 h-4" />}
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* History timeline */}
          <div className="lftg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Historique</h2>
            {(!instance.history || instance.history.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune transition enregistrée</p>
            ) : (
              <div className="space-y-0">
                {instance.history.map((h: any, idx: number) => (
                  <div key={h.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-forest-100 border-2 border-forest-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-forest-700">{idx + 1}</span>
                      </div>
                      {idx < instance.history.length - 1 && (
                        <div className="w-0.5 h-full bg-border my-1" />
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{h.transition}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <StateBadge state={h.toState} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {h.user?.name ?? 'Système'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(h.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      {h.notes && (
                        <p className="mt-1 text-xs text-muted-foreground italic bg-muted/50 px-2 py-1 rounded">
                          "{h.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="lftg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Informations</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-muted-foreground">Définition</dt>
                <dd className="text-sm font-medium text-foreground">{definition?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Type d'entité</dt>
                <dd className="text-sm font-medium text-foreground">{definition?.entityType}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">ID entité</dt>
                <dd className="text-xs font-mono text-muted-foreground break-all">{instance.entityId}</dd>
              </div>
              {instance.assignee && (
                <div>
                  <dt className="text-xs text-muted-foreground">Assigné à</dt>
                  <dd className="text-sm font-medium text-foreground">{instance.assignee.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted-foreground">Créé le</dt>
                <dd className="text-sm text-foreground">{new Date(instance.createdAt).toLocaleString('fr-FR')}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Mis à jour</dt>
                <dd className="text-sm text-foreground">{new Date(instance.updatedAt).toLocaleString('fr-FR')}</dd>
              </div>
            </dl>
          </div>

          {/* Context data */}
          {instance.context && Object.keys(instance.context).length > 0 && (
            <div className="lftg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Données contextuelles</h3>
              <pre className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg overflow-auto max-h-48">
                {JSON.stringify(instance.context, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Transition confirmation modal */}
      <TransitionModal
        isOpen={!!selectedTransition}
        onClose={() => setSelectedTransition(null)}
        transition={selectedTransition}
        onConfirm={(notes) => {
          if (selectedTransition) {
            mutation.mutate({ transitionKey: selectedTransition.key, notes });
          }
        }}
        loading={mutation.isPending}
      />
    </div>
  );
}
