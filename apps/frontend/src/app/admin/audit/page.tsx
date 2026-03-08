'use client';

import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Search } from 'lucide-react';
import { auditApi } from '@/lib/api';
import { useState } from 'react';

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const { data: logs, isLoading, isError, refetch } = useQuery({ queryKey: ['audit-logs'], queryFn: () => auditApi.list() });

  const filtered = (logs || []).filter((l: any) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.subject.toLowerCase().includes(search.toLowerCase()) ||
    l.user?.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const actionColor = (action: string) => {
    if (action.includes('create') || action.includes('register')) return 'badge-approved';
    if (action.includes('delete') || action.includes('reject')) return 'badge-rejected';
    if (action.includes('update') || action.includes('transition')) return 'badge-pending';
    return 'badge-draft';
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Journal d'audit</h1>
          <p className="text-sm text-muted-foreground mt-1">{logs?.length ?? 0} entrées (500 dernières)</p>
        </div>
      </div>

      <div className="lftg-card p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par action, sujet ou utilisateur..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3 py-6">{[1,2,3,4].map(i => <div key={i} className="h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg mx-4" />)}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((log: any) => (
              <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`lftg-badge ${actionColor(log.action)}`}>{log.action}</span>
                    <span className="text-sm font-medium text-foreground truncate">{log.subject}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Par <span className="font-medium">{log.user?.name || log.user?.email || log.userId}</span>
                  </p>
                  {log.details && (
                    <pre className="mt-1 text-xs text-muted-foreground bg-muted rounded p-2 overflow-x-auto max-h-20">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(log.timestamp).toLocaleString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-center py-12 text-muted-foreground text-sm">Aucune entrée d'audit</p>
        )}
      </div>
    </div>
  );
}
