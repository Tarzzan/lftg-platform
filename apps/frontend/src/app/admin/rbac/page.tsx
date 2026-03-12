'use client';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, usersApi } from '@/lib/api';
import { api } from '@/lib/api';

// ─── API helpers supplémentaires ──────────────────────────────────────────────
const permissionsApi = {
  list: () => api.get('/roles/permissions/all').then((r) => r.data),
  create: (data: { action: string; subject: string; description?: string }) =>
    api.post('/roles/permissions/create', data).then((r) => r.data),
};

const rolePermissionsApi = {
  toggle: (roleId: string, permissionId: string) =>
    api.post(`/roles/${roleId}/permissions/${permissionId}/toggle`).then((r) => r.data),
  set: (roleId: string, permissionIds: string[]) =>
    api.put(`/roles/${roleId}/permissions`, { permissionIds }).then((r) => r.data),
};

// ─── Constantes ───────────────────────────────────────────────────────────────
const ACTIONS = ['read', 'create', 'update', 'delete', 'manage'];
const ACTION_LABELS: Record<string, string> = {
  read: 'Lire',
  create: 'Créer',
  update: 'Modifier',
  delete: 'Supprimer',
  manage: 'Gérer tout',
};
const ACTION_COLORS: Record<string, string> = {
  read: 'text-blue-600 dark:text-blue-400',
  create: 'text-green-600 dark:text-green-400',
  update: 'text-amber-600 dark:text-amber-400',
  delete: 'text-red-600 dark:text-red-400',
  manage: 'text-purple-600 dark:text-purple-400',
};

// ─── Composant principal ──────────────────────────────────────────────────────
export default function RbacPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'matrix' | 'users' | 'roles'>('matrix');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [newPerm, setNewPerm] = useState({ action: '', subject: '', description: '' });
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  // ─── Queries ────────────────────────────────────────────────────────────────
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  });

  const { data: permissions = [], isLoading: permsLoading } = useQuery({
    queryKey: ['permissions-all'],
    queryFn: permissionsApi.list,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const createRoleMutation = useMutation({
    mutationFn: (data: any) => rolesApi.create(data),
    onSuccess: () => {
      toast.success('Rôle créé avec succès');
      qc.invalidateQueries({ queryKey: ['roles'] });
      setShowRoleModal(false);
      setNewRole({ name: '', description: '' });
    },
    onError: () => toast.error('Erreur lors de la création du rôle'),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      toast.success('Rôle supprimé');
      qc.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: () => toast.error('Impossible de supprimer ce rôle'),
  });

  const createPermMutation = useMutation({
    mutationFn: (data: any) => permissionsApi.create(data),
    onSuccess: () => {
      toast.success('Permission créée avec succès');
      qc.invalidateQueries({ queryKey: ['permissions-all'] });
      setShowPermModal(false);
      setNewPerm({ action: '', subject: '', description: '' });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de la création'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      rolePermissionsApi.toggle(roleId, permissionId),
    onMutate: ({ roleId, permissionId }) => {
      setPendingToggles((prev) => new Set(prev).add(`${roleId}:${permissionId}`));
    },
    onSuccess: (data, { roleId, permissionId }) => {
      setPendingToggles((prev) => {
        const next = new Set(prev);
        next.delete(`${roleId}:${permissionId}`);
        return next;
      });
      qc.invalidateQueries({ queryKey: ['roles'] });
      toast.success(data.toggled === 'added' ? 'Permission accordée' : 'Permission retirée');
    },
    onError: (_, { roleId, permissionId }) => {
      setPendingToggles((prev) => {
        const next = new Set(prev);
        next.delete(`${roleId}:${permissionId}`);
        return next;
      });
      toast.error('Erreur lors de la modification de la permission');
    },
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const hasPermission = useCallback(
    (role: any, permissionId: string) => {
      if (role.name === 'admin') return true;
      return (role.permissions || []).some((p: any) => p.id === permissionId);
    },
    [],
  );

  const handleToggle = useCallback(
    (roleId: string, permissionId: string, isAdmin: boolean) => {
      if (isAdmin) {
        toast.info('Le rôle admin a toutes les permissions par défaut');
        return;
      }
      const key = `${roleId}:${permissionId}`;
      if (pendingToggles.has(key)) return;
      toggleMutation.mutate({ roleId, permissionId });
    },
    [pendingToggles, toggleMutation],
  );

  // Grouper les permissions par ressource (subject)
  const permsBySubject = permissions.reduce((acc: Record<string, any[]>, p: any) => {
    if (!acc[p.subject]) acc[p.subject] = [];
    acc[p.subject].push(p);
    return acc;
  }, {});

  const subjects = Object.keys(permsBySubject).sort();

  // ─── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des accès (RBAC)</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configurez les rôles et leurs permissions sur chaque ressource
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPermModal(true)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5"
          >
            <span className="text-base leading-none">+</span> Nouvelle permission
          </button>
          <button
            onClick={() => setShowRoleModal(true)}
            className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1.5"
          >
            <span className="text-base leading-none">+</span> Nouveau rôle
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(['matrix', 'users', 'roles'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t === 'matrix' ? 'Matrice des permissions' : t === 'users' ? 'Utilisateurs' : 'Rôles'}
          </button>
        ))}
      </div>

      {/* ── Matrice interactive ─────────────────────────────────────────────── */}
      {tab === 'matrix' && (
        <div className="space-y-4">
          {/* Légende */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 rounded-lg px-4 py-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Légende :</span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-green-500 inline-block" /> Accordée
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-600 inline-block" /> Refusée
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-purple-200 dark:bg-purple-900/50 inline-block" /> Admin (toutes)
            </span>
            <span className="ml-auto italic">Cliquez sur une case pour modifier</span>
          </div>

          {rolesLoading || permsLoading ? (
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : roles.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">Aucun rôle configuré</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm border-collapse">
                <thead>
                  {/* Ligne 1 : noms des rôles */}
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold min-w-[160px] sticky left-0 bg-gray-50 dark:bg-gray-900/50 z-10">
                      Ressource
                    </th>
                    {roles.map((role: any) => (
                      <th
                        key={role.id}
                        colSpan={ACTIONS.length}
                        className="text-center py-3 px-2 font-semibold border-l border-gray-200 dark:border-gray-700"
                      >
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            role.name === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}
                        >
                          {role.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                  {/* Ligne 2 : labels des actions */}
                  <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 px-4 sticky left-0 bg-white dark:bg-gray-800 z-10" />
                    {roles.map((role: any) =>
                      ACTIONS.map((action) => (
                        <th
                          key={`${role.id}-${action}`}
                          className={`py-2 px-1 text-xs font-medium border-l border-gray-100 dark:border-gray-700 text-center min-w-[52px] ${ACTION_COLORS[action]}`}
                        >
                          {ACTION_LABELS[action]}
                        </th>
                      )),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, subjectIdx) => (
                    <tr
                      key={subject}
                      className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors ${
                        subjectIdx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-900/10'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-semibold text-gray-700 dark:text-gray-300 capitalize sticky left-0 bg-inherit z-10">
                        {subject}
                      </td>
                      {roles.map((role: any) => {
                        const isAdmin = role.name === 'admin';
                        return ACTIONS.map((action) => {
                          // Trouver la permission correspondante
                          const perm = (permsBySubject[subject] || []).find(
                            (p: any) => p.action === action,
                          );
                          if (!perm) {
                            return (
                              <td
                                key={`${role.id}-${subject}-${action}`}
                                className="py-2.5 px-1 text-center border-l border-gray-100 dark:border-gray-700"
                              >
                                <span className="inline-block w-4 h-4 rounded text-xs bg-gray-100 dark:bg-gray-700 opacity-30" title="Permission non définie" />
                              </td>
                            );
                          }

                          const granted = hasPermission(role, perm.id);
                          const key = `${role.id}:${perm.id}`;
                          const isPending = pendingToggles.has(key);

                          return (
                            <td
                              key={`${role.id}-${subject}-${action}`}
                              className="py-2.5 px-1 text-center border-l border-gray-100 dark:border-gray-700"
                            >
                              <button
                                onClick={() => handleToggle(role.id, perm.id, isAdmin)}
                                disabled={isPending}
                                title={
                                  isAdmin
                                    ? 'Admin : toutes les permissions'
                                    : granted
                                    ? `Cliquer pour retirer ${subject}:${action} de ${role.name}`
                                    : `Cliquer pour accorder ${subject}:${action} à ${role.name}`
                                }
                                className={`inline-flex items-center justify-center w-6 h-6 rounded transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
                                  isPending
                                    ? 'opacity-50 cursor-wait animate-pulse bg-gray-300 dark:bg-gray-500'
                                    : isAdmin
                                    ? 'bg-purple-200 dark:bg-purple-900/50 cursor-default'
                                    : granted
                                    ? 'bg-green-500 hover:bg-green-600 cursor-pointer shadow-sm'
                                    : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer'
                                }`}
                              >
                                {isPending ? (
                                  <svg className="w-3 h-3 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : granted ? (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </button>
                            </td>
                          );
                        });
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Utilisateurs ────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="space-y-2">
          {usersLoading ? (
            <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : users.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aucun utilisateur</p>
          ) : (
            users.map((user: any) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-400">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{user.name || user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {(user.roles || []).map((role: any) => (
                    <span
                      key={role.id}
                      className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-medium"
                    >
                      {role.name}
                    </span>
                  ))}
                  {(!user.roles || user.roles.length === 0) && (
                    <span className="text-xs text-gray-400 italic">Aucun rôle</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Rôles ───────────────────────────────────────────────────────────── */}
      {tab === 'roles' && (
        <div className="space-y-3">
          {rolesLoading ? (
            <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : roles.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aucun rôle configuré</p>
          ) : (
            roles.map((role: any) => {
              const roleUsers = users.filter((u: any) =>
                u.roles?.some((r: any) => r.id === role.id),
              );
              const perms = role.permissions || [];
              return (
                <div
                  key={role.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-bold">
                        {role.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {roleUsers.length} utilisateur{roleUsers.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{perms.length} permission{perms.length !== 1 ? 's' : ''}</span>
                      {role.name !== 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer le rôle "${role.name}" ?`)) {
                              deleteRoleMutation.mutate(role.id);
                            }
                          }}
                          className="text-xs text-red-500 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                  {role.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{role.description}</p>
                  )}
                  {perms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {perms.map((p: any) => (
                        <span
                          key={p.id}
                          className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400"
                        >
                          {p.subject}:{p.action}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Modal création de rôle ──────────────────────────────────────────── */}
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
                  onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ex: veterinaire"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))}
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

      {/* ── Modal création de permission ────────────────────────────────────── */}
      {showPermModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nouvelle permission</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ressource (subject)</label>
                <input
                  type="text"
                  value={newPerm.subject}
                  onChange={(e) => setNewPerm((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ex: Animal, Medical, Formation…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
                <select
                  value={newPerm.action}
                  onChange={(e) => setNewPerm((prev) => ({ ...prev, action: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Sélectionner une action</option>
                  {ACTIONS.map((a) => (
                    <option key={a} value={a}>{ACTION_LABELS[a]} ({a})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optionnel)</label>
                <input
                  type="text"
                  value={newPerm.description}
                  onChange={(e) => setNewPerm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Description de la permission"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPermModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={() => createPermMutation.mutate(newPerm)}
                disabled={!newPerm.subject || !newPerm.action || createPermMutation.isPending}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {createPermMutation.isPending ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
