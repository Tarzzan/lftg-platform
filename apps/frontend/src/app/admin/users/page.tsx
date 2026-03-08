'use client';
import { toast } from 'sonner';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Shield, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useState } from 'react';
import { UserModal } from '@/components/modals/UserModal';

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [userModal, setUserModal] = useState<{ open: boolean; user?: any }>({ open: false });

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const filtered = (users || []).filter((u: any) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (user: any) => {
    if (confirm(`Supprimer l'utilisateur ${user.name || user.email} ?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{users?.length ?? 0} utilisateurs enregistrés</p>
        </div>
        <button
          onClick={() => setUserModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvel utilisateur
        </button>
      </div>

      <div className="lftg-card p-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3 py-6">{[1,2,3,4].map(i => <div key={i} className="h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg mx-4" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Utilisateur</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Rôles</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Équipes</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Statut</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Créé le</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user: any) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-semibold text-xs flex-shrink-0">
                          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role: any) => (
                          <span key={role.id} className="inline-flex items-center gap-1 badge-active">
                            <Shield className="w-2.5 h-2.5" />
                            {role.name}
                          </span>
                        ))}
                        {!user.roles?.length && <span className="text-muted-foreground text-xs">Aucun rôle</span>}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1">
                        {user.teams?.map((team: any) => (
                          <span key={team.id} className="badge-draft">{team.name}</span>
                        ))}
                        {!user.teams?.length && <span className="text-muted-foreground text-xs">—</span>}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {user.isActive !== false ? (
                        <span className="flex items-center gap-1 text-forest-600 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Actif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Inactif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setUserModal({ open: true, user })}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 rounded hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center py-8 text-muted-foreground text-sm">Aucun utilisateur trouvé</p>
            )}
          </div>
        )}
      </div>

      <UserModal
        isOpen={userModal.open}
        onClose={() => setUserModal({ open: false })}
        user={userModal.user}
      />
    </div>
  );
}
