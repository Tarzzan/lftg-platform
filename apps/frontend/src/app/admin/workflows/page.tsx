'use client';

import { useQuery } from '@tanstack/react-query';
import { GitBranch, Clock, CheckCircle, XCircle, ArrowRight, Plus } from 'lucide-react';
import { workflowsApi } from '@/lib/api';
import Link from 'next/link';

const stateColors: Record<string, string> = {
  draft: 'badge-draft',
  pending: 'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  active: 'badge-active',
  completed: 'badge-approved',
  cancelled: 'badge-rejected',
};

export default function WorkflowsPage() {
  const { data: instances, isLoading , isError } = useQuery({
    queryKey: ['workflow-instances'],
    queryFn: () => workflowsApi.instances(),
  });

  const { data: definitions } = useQuery({
    queryKey: ['workflow-definitions'],
    queryFn: workflowsApi.definitions,
  });

  const grouped = (instances || []).reduce((acc: Record<string, any[]>, inst: any) => {
    const key = inst.currentState;
    if (!acc[key]) acc[key] = [];
    acc[key].push(inst);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {instances?.length ?? 0} instances · {definitions?.length ?? 0} définitions
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/workflows/editor" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Créer un workflow
          </Link>
        </div>
      </div>

      {/* Summary by state */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(grouped).map(([state, items]) => (
          <div key={state} className="stat-card">
            <p className="text-xs text-muted-foreground capitalize">{state}</p>
            <p className="text-2xl font-display font-bold text-foreground">{(items as any[]).length}</p>
            <span className={`lftg-badge mt-1 ${stateColors[state] || 'badge-draft'}`}>{state}</span>
          </div>
        ))}
      </div>

      {/* Instances list */}
      <div className="lftg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">Instances en cours</h2>
        </div>
        {isLoading ? (
          <div className="space-y-3 py-6">{[1,2,3,4].map(i => <div key={i} className="h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg mx-4" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Workflow</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Entité</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">État</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assigné à</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mis à jour</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {(instances || []).map((inst: any) => (
                <tr key={inst.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-maroni-500 flex-shrink-0" />
                      <span className="font-medium text-foreground">{inst.definition?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{inst.entityId.slice(0, 12)}...</td>
                  <td className="py-3 px-4">
                    <span className={`lftg-badge ${stateColors[inst.currentState] || 'badge-draft'}`}>
                      {inst.currentState}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {inst.assignee?.name || inst.assignee?.email || '—'}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {new Date(inst.updatedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/workflows/${inst.id}`}
                      className="flex items-center gap-1 text-xs text-forest-600 hover:text-forest-700 font-medium"
                    >
                      Détail <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && instances?.length === 0 && (
          <p className="text-center py-12 text-muted-foreground text-sm">Aucune instance de workflow</p>
        )}
      </div>
    </div>
  );
}
