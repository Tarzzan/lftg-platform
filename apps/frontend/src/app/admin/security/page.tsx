'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Users, AlertTriangle, Lock, RefreshCw, Eye, Activity, Clock } from 'lucide-react';
import { api } from '@/lib/api';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-gray-100 text-gray-600',
  EXPORT: 'bg-orange-100 text-orange-800',
  VIEW: 'bg-indigo-100 text-indigo-800',
};

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'users' | 'roles'>('audit');

  const { data: auditLogs, isLoading: loadingAudit, refetch, isError } = useQuery({
    queryKey: ['security-audit'],
    queryFn: () => api.get('/audit?limit=50').then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['security-users'],
    queryFn: () => api.get('/users').then(r => r.data),
  });

  const { data: roles, isLoading: loadingRoles } = useQuery({
    queryKey: ['security-roles'],
    queryFn: () => api.get('/roles').then(r => r.data),
  });

  const logs: any[] = Array.isArray(auditLogs) ? auditLogs : (auditLogs?.data ?? auditLogs?.logs ?? []);
  const userList: any[] = Array.isArray(users) ? users : (users?.data ?? []);
  const roleList: any[] = Array.isArray(roles) ? roles : (roles?.data ?? []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-600" />
            Sécurité & Audit
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestion des accès, rôles et journal d'audit</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:bg-muted/20 text-sm">
          <RefreshCw className="w-4 h-4 text-gray-500" />
          Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs actifs', value: userList.filter(u => u.isActive !== false).length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Rôles définis', value: roleList.length, icon: Lock, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Événements audit (50)', value: logs.length, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Actions critiques', value: logs.filter(l => l.action === 'DELETE' || l.action === 'EXPORT').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-card rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['audit', 'users', 'roles'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white text-gray-900 dark:text-foreground shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
            {tab === 'audit' ? 'Journal d\'audit' : tab === 'users' ? 'Utilisateurs' : 'Rôles'}
          </button>
        ))}
      </div>

      {/* Audit */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loadingAudit ? (
            <div className="p-8 text-center text-gray-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-400"><Activity className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Aucun événement d'audit</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ressource</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">IP</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log: any, i: number) => (
                    <tr key={log.id ?? i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                          {log.action ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{log.resource ?? log.entity ?? '—'}{log.resourceId ? ` #${log.resourceId}` : ''}</td>
                      <td className="px-4 py-3 text-gray-600">{log.user?.name ?? log.user?.email ?? log.userId ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{log.ipAddress ?? log.ip ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('fr-FR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loadingUsers ? (
            <div className="p-8 text-center text-gray-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rôle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Créé le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {userList.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name ?? (`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—')}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{u.role ?? u.roles?.[0] ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {u.isActive !== false ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Roles */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingRoles ? (
            <div className="col-span-3 text-center py-8 text-gray-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement...</div>
          ) : roleList.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-400"><Lock className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Aucun rôle défini</p></div>
          ) : roleList.map((role: any) => (
            <div key={role.id} className="bg-white dark:bg-card rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <p className="font-medium text-gray-900">{role.name}</p>
              </div>
              {role.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{role.description}</p>}
              {role.permissions && (
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(role.permissions) ? role.permissions : []).slice(0, 5).map((p: string) => (
                    <span key={p} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">{p}</span>
                  ))}
                  {role.permissions.length > 5 && <span className="text-xs text-gray-400">+{role.permissions.length - 5}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
