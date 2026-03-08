'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, usersApi } from '@/lib/api';

export default function RbacPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'matrix' | 'users' | 'roles'>('matrix');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  const { data: roles = [], isLoading: rolesLoading, isError: rolesError, refetch: refetchRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: any) => rolesApi.create(data),
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      qc.invalidateQueries({ queryKey: ['roles'] });
      setShowRoleModal(false);
      setNewRole({ name: '', description: '' });
    },
  });

  const PERMISSION_RESOURCES = ['animaux', 'medical', 'enclos', 'utilisateurs', 'rapports', 'ventes', 'stock', 'formation'];
  const ACTIONS = ['read', 'create', 'update', 'delete'];
  const ACTION_LABELS: Record<string, string> = { read: 'Lire', create: 'Créer', update: 'Modifier', delete: 'Supprimer' };

  const getRolePermissions = (role: any) => {
    const perms = role.permissions || [];
    return perms.map((p: any) => `${p.resource}:${p.action}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contrôle d'accès RBAC</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestion des rôles et permissions granulaires</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm font-medium">
            {roles.length} rôles · {users.length} utilisateurs
          </span>
          <button
            onClick={() => setShowRoleModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            + Nouveau rôle
          </button>
        </div>
      </div>

      {/* Statistiques des rôles */}
      {rolesLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {roles.slice(0, 4).map((role: any) => {
            const roleUsers = users.filter((u: any) => u.roles?.some((r: any) => r.id === role.id));
            return (
              <div key={role.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  {role.name}
                </span>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{roleUsers.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">utilisateur{roleUsers.length !== 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['matrix', 'users', 'roles'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {t === 'matrix' ? 'Matrice des permissions' : t === 'users' ? 'Utilisateurs' : 'Rôles'}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Matrice des permissions */}
          {tab === 'matrix' && (
            <div className="overflow-x-auto">
              {rolesLoading ? (
                <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">Ressource / Action</th>
                      {roles.map((role: any) => (
                        <th key={role.id} colSpan={ACTIONS.length} className="text-center py-2 px-2 text-gray-600 dark:text-gray-400 font-medium border-l border-gray-100 dark:border-gray-700">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <th className="py-1 px-3"></th>
                      {roles.map((role: any) =>
                        ACTIONS.map(action => (
                          <th key={`${role.id}-${action}`} className="py-1 px-1 text-xs text-gray-400 font-normal border-l border-gray-100 dark:border-gray-700">
                            {ACTION_LABELS[action]}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_RESOURCES.map((resource) => (
                      <tr key={resource} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300 capitalize">{resource}</td>
                        {roles.map((role: any) => {
                          const rolePerms = getRolePermissions(role);
                          return ACTIONS.map(action => {
                            const hasPermission = rolePerms.includes(`${resource}:${action}`) || role.name === 'admin';
                            return (
                              <td key={`${role.id}-${resource}-${action}`} className="py-2 px-1 text-center border-l border-gray-100 dark:border-gray-700">
                                <span className={`inline-block w-4 h-4 rounded-full text-xs ${hasPermission ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`} title={hasPermission ? 'Autorisé' : 'Refusé'} />
                              </td>
                            );
                          });
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Utilisateurs */}
          {tab === 'users' && (
            <div className="space-y-2">
              {usersLoading ? (
                <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ) : users.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun utilisateur</p>
              ) : (
                users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-400">
                        {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {(user.roles || []).map((role: any) => (
                        <span key={role.id} className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs">
                          {role.name}
                        </span>
                      ))}
                      {(!user.roles || user.roles.length === 0) && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 rounded-full text-xs">Aucun rôle</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Rôles */}
          {tab === 'roles' && (
            <div className="space-y-3">
              {rolesLoading ? (
                <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ) : roles.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun rôle configuré</p>
              ) : (
                roles.map((role: any) => {
                  const roleUsers = users.filter((u: any) => u.roles?.some((r: any) => r.id === role.id));
                  const perms = role.permissions || [];
                  return (
                    <div key={role.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-medium">
                            {role.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{roleUsers.length} utilisateur{roleUsers.length !== 1 ? 's' : ''}</span>
                        </div>
                        <span className="text-xs text-gray-400">{perms.length} permission{perms.length !== 1 ? 's' : ''}</span>
                      </div>
                      {role.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{role.description}</p>
                      )}
                      {perms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {perms.slice(0, 8).map((p: any, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400">
                              {p.resource}:{p.action}
                            </span>
                          ))}
                          {perms.length > 8 && (
                            <span className="px-1.5 py-0.5 text-xs text-gray-400">+{perms.length - 8}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal création de rôle */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nouveau rôle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du rôle</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ex: veterinaire"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Description du rôle"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={() => createRoleMutation.mutate(newRole)}
                disabled={!newRole.name || createRoleMutation.isPending}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {createRoleMutation.isPending ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
