'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, LogOut, AlertTriangle, User, Shield, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { api as apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UserItem { id: string; name: string; email: string; roles?: string[]; createdAt?: string; }

export default function ModeTestPage() {
  const router = useRouter();
  const { user: currentUser, token: currentToken, setAuth } = useAuthStore();
  const [search, setSearch] = useState('');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<UserItem | null>(null);
  const [originalAuth, setOriginalAuth] = useState<{ user: any; token: string } | null>(null);

  const { data: users = [], isLoading } = useQuery<UserItem[]>({
    queryKey: ['users-for-impersonate'],
    queryFn: () => apiClient.get('/users').then((r) => r.data),
  });

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleImpersonate = async (targetUser: UserItem) => {
    try {
      const res = await apiClient.post('/auth/impersonate', { userId: targetUser.id });
      const { accessToken, user: impUser } = res.data;

      // Sauvegarder l'auth admin originale
      setOriginalAuth({ user: currentUser, token: currentToken! });

      // Appliquer le token de l'utilisateur simulé
      setAuth(impUser, accessToken);
      setImpersonatedUser(targetUser);
      setIsImpersonating(true);

      toast.success(`Mode test activé — vous voyez la plateforme comme ${targetUser.name || targetUser.email}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de l\'activation du mode test');
    }
  };

  const handleStopImpersonate = () => {
    if (originalAuth) {
      setAuth(originalAuth.user, originalAuth.token);
      setOriginalAuth(null);
      setImpersonatedUser(null);
      setIsImpersonating(false);
      toast.success('Mode test désactivé — vous êtes revenu à votre compte admin');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mode test utilisateur</h1>
          <p className="text-sm text-gray-500 mt-1">Simulez la vue et les droits d'un utilisateur spécifique</p>
        </div>
      </div>

      {/* Bannière mode test actif */}
      {isImpersonating && impersonatedUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">Mode test actif</p>
              <p className="text-sm text-amber-600">
                Vous simulez la vue de <strong>{impersonatedUser.name || impersonatedUser.email}</strong>
                {' '}— Le token expire dans 1 heure
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
            >
              <Eye className="w-4 h-4" /> Voir le dashboard
            </button>
            <button
              onClick={handleStopImpersonate}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Quitter le mode test
            </button>
          </div>
        </div>
      )}

      {/* Avertissement */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">Comment fonctionne le mode test ?</p>
          <p>Un token temporaire (1 heure) est généré pour l'utilisateur sélectionné. Vous naviguez sur la plateforme avec ses droits exacts. Cliquez sur <strong>Quitter le mode test</strong> pour revenir à votre compte admin.</p>
        </div>
      </div>

      {/* Sélection de l'utilisateur */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" /> Choisir un utilisateur à simuler
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Chargement des utilisateurs...</div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {filteredUsers.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-400">Aucun utilisateur trouvé</p>
            )}
            {filteredUsers.map((user) => {
              const isCurrentAdmin = user.id === currentUser?.id;
              const isActive = impersonatedUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${isActive ? 'bg-amber-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      isActive ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {(user.name || user.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{user.name || '(sans nom)'}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="flex gap-1 mt-0.5">
                        {(user.roles || []).map((role) => (
                          <span key={role} className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                          }`}>{role}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    {isCurrentAdmin ? (
                      <span className="text-xs text-gray-400 italic">Votre compte</span>
                    ) : isActive ? (
                      <span className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-1 rounded">En cours</span>
                    ) : (
                      <button
                        onClick={() => handleImpersonate(user)}
                        className="flex items-center gap-1.5 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Simuler
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
