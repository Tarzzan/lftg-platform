'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Users, BookOpen, UserPlus, UserMinus, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { api, formationApi } from '@/lib/api';

interface User { id: string; name: string; email: string; role: string; }
interface Course { id: string; title: string; category?: string; level?: string; }
interface Cohort { id: string; name: string; courseId: string; course?: Course; status: string; enrollments?: any[]; }
interface Enrollment { id: string; userId: string; cohortId: string; enrolledAt: string; progress: number; cohort?: Cohort; }

export default function AccesFormationPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<'par-cohorte' | 'par-utilisateur'>('par-cohorte');
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchUser, setSearchUser] = useState('');
  const [expandedCohorts, setExpandedCohorts] = useState<Set<string>>(new Set());

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  });

  const { data: cohorts = [] } = useQuery<Cohort[]>({
    queryKey: ['cohorts'],
    queryFn: () => formationApi.cohorts().then((d: any) => d),
  });

  const { data: cohortEnrollments = [] } = useQuery<any[]>({
    queryKey: ['cohort-enrollments', selectedCohort],
    queryFn: () => selectedCohort ? formationApi.getCohortEnrollments(selectedCohort) : Promise.resolve([]),
    enabled: !!selectedCohort,
  });

  const { data: userAccess = [] } = useQuery<Enrollment[]>({
    queryKey: ['user-access', selectedUser],
    queryFn: () => selectedUser ? formationApi.getUserAccess(selectedUser) : Promise.resolve([]),
    enabled: !!selectedUser,
  });

  const enrollMutation = useMutation({
    mutationFn: ({ cohortId, userId }: { cohortId: string; userId: string }) =>
      formationApi.adminEnroll(cohortId, userId),
    onSuccess: () => {
      toast.success('Utilisateur inscrit avec succès');
      qc.invalidateQueries({ queryKey: ['cohort-enrollments', selectedCohort] });
      qc.invalidateQueries({ queryKey: ['user-access', selectedUser] });
    },
    onError: () => toast.error('Erreur lors de l\'inscription'),
  });

  const unenrollMutation = useMutation({
    mutationFn: (enrollmentId: string) => formationApi.unenroll(enrollmentId),
    onSuccess: () => {
      toast.success('Inscription supprimée');
      qc.invalidateQueries({ queryKey: ['cohort-enrollments', selectedCohort] });
      qc.invalidateQueries({ queryKey: ['user-access', selectedUser] });
    },
    onError: () => toast.error('Erreur lors de la désinscription'),
  });

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const enrolledUserIds = new Set(cohortEnrollments.map((e: any) => e.userId));

  const toggleCohortExpand = (cohortId: string) => {
    setExpandedCohorts((prev) => {
      const next = new Set(prev);
      if (next.has(cohortId)) next.delete(cohortId);
      else { next.add(cohortId); setSelectedCohort(cohortId); }
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accès aux formations</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les inscriptions individuelles aux cohortes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('par-cohorte')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'par-cohorte' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Users className="w-4 h-4 inline mr-1" /> Par cohorte
          </button>
          <button
            onClick={() => setView('par-utilisateur')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'par-utilisateur' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Shield className="w-4 h-4 inline mr-1" /> Par utilisateur
          </button>
        </div>
      </div>

      {view === 'par-cohorte' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des cohortes */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" /> Cohortes
              </h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {cohorts.length === 0 && (
                <p className="p-4 text-sm text-gray-400 text-center">Aucune cohorte</p>
              )}
              {cohorts.map((cohort: Cohort) => (
                <button
                  key={cohort.id}
                  onClick={() => { setSelectedCohort(cohort.id); setExpandedCohorts(new Set([cohort.id])); }}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedCohort === cohort.id ? 'bg-emerald-50 border-l-2 border-emerald-500' : ''}`}
                >
                  <div className="font-medium text-sm text-gray-800">{cohort.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{cohort.course?.title || 'Formation inconnue'}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                    cohort.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    cohort.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                    'bg-blue-100 text-blue-700'
                  }`}>{cohort.status}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gestion des inscrits */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedCohort ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Sélectionnez une cohorte pour gérer ses inscrits</p>
              </div>
            ) : (
              <>
                {/* Inscrire un utilisateur */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-600" /> Inscrire un utilisateur
                  </h3>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
                    {filteredUsers.map((user) => {
                      const isEnrolled = enrolledUserIds.has(user.id);
                      return (
                        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                          <div>
                            <div className="text-sm font-medium text-gray-800">{user.name || user.email}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                          {isEnrolled ? (
                            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">Inscrit</span>
                          ) : (
                            <button
                              onClick={() => enrollMutation.mutate({ cohortId: selectedCohort, userId: user.id })}
                              disabled={enrollMutation.isPending}
                              className="text-xs bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                              Inscrire
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Liste des inscrits */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" /> Inscrits ({cohortEnrollments.length})
                    </h3>
                  </div>
                  {cohortEnrollments.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-400">Aucun inscrit dans cette cohorte</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {cohortEnrollments.map((enrollment: any) => {
                        const user = users.find((u) => u.id === enrollment.userId);
                        return (
                          <div key={enrollment.id} className="flex items-center justify-between p-4">
                            <div>
                              <div className="text-sm font-medium text-gray-800">{user?.name || enrollment.userId}</div>
                              <div className="text-xs text-gray-500">{user?.email}</div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                Inscrit le {new Date(enrollment.enrolledAt).toLocaleDateString('fr-FR')}
                                {enrollment.progress > 0 && ` · ${Math.round(enrollment.progress)}% complété`}
                              </div>
                            </div>
                            <button
                              onClick={() => unenrollMutation.mutate(enrollment.id)}
                              disabled={unenrollMutation.isPending}
                              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              <UserMinus className="w-3.5 h-3.5" /> Désinscrire
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {view === 'par-utilisateur' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des utilisateurs */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedUser === user.id ? 'bg-emerald-50 border-l-2 border-emerald-500' : ''}`}
                >
                  <div className="font-medium text-sm text-gray-800">{user.name || user.email}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>{user.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accès de l'utilisateur */}
          <div className="lg:col-span-2">
            {!selectedUser ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Sélectionnez un utilisateur pour voir ses accès</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">
                      Formations accessibles ({userAccess.length})
                    </h3>
                    {/* Inscrire à une cohorte */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          enrollMutation.mutate({ cohortId: e.target.value, userId: selectedUser });
                          e.target.value = '';
                        }
                      }}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">+ Ajouter une cohorte</option>
                      {cohorts.map((c: Cohort) => (
                        <option key={c.id} value={c.id}>{c.name} — {c.course?.title}</option>
                      ))}
                    </select>
                  </div>
                  {userAccess.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-400">Cet utilisateur n'a accès à aucune formation</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {userAccess.map((enrollment: Enrollment) => (
                        <div key={enrollment.id} className="flex items-center justify-between p-4">
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {enrollment.cohort?.course?.title || 'Formation inconnue'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Cohorte : {enrollment.cohort?.name}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-emerald-500 h-1.5 rounded-full"
                                  style={{ width: `${Math.round(enrollment.progress || 0)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400">{Math.round(enrollment.progress || 0)}%</span>
                            </div>
                          </div>
                          <button
                            onClick={() => unenrollMutation.mutate(enrollment.id)}
                            disabled={unenrollMutation.isPending}
                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            <UserMinus className="w-3.5 h-3.5" /> Révoquer
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
