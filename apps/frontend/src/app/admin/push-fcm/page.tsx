'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface PushSubscription {
  id: string;
  endpoint?: string;
  userAgent?: string;
  createdAt?: string;
  userId?: string;
}

export default function PushFCMPage() {
  const [broadcastForm, setBroadcastForm] = useState({ title: '', body: '', url: '' });
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  const { data: vapidKey } = useQuery<{ publicKey: string }>({
    queryKey: ['push-vapid'],
    queryFn: async () => {
      const res = await api.get('/push/vapid-public-key');
      return res.data;
    },
  });

  const { data: subscriptions = [], isLoading } = useQuery<PushSubscription[]>({
    queryKey: ['push-subscriptions'],
    queryFn: async () => {
      const res = await api.get('/push/subscriptions');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const broadcastMutation = useMutation({
    mutationFn: async (data: typeof broadcastForm) => {
      const res = await api.post('/push/broadcast', data);
      return res.data;
    },
    onSuccess: (data) => {
      setBroadcastResult(`Notification envoyée à ${data.sent || 0} abonné(s)`);
      setBroadcastForm({ title: '', body: '', url: '' });
    },
    onError: () => {
      setBroadcastResult('Erreur lors de l\'envoi');
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/push/test', { title: 'Test LFTG', body: 'Notification de test' });
      return res.data;
    },
    onSuccess: () => {
      setBroadcastResult('Notification de test envoyée');
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications Push & FCM</h1>
        <p className="text-slate-400 mt-1">Gestion des notifications push Web et Firebase Cloud Messaging</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Abonnés actifs</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{subscriptions.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Clé VAPID</p>
          <p className={`text-sm font-semibold mt-1 ${vapidKey ? 'text-green-400' : 'text-red-400'}`}>
            {vapidKey ? '✅ Configurée' : '❌ Non configurée'}
          </p>
          {vapidKey && (
            <p className="text-slate-500 text-xs mt-1 font-mono truncate">{vapidKey.publicKey?.substring(0, 20)}...</p>
          )}
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Test rapide</p>
          <button
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending}
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {testMutation.isPending ? 'Envoi...' : '🔔 Envoyer test'}
          </button>
        </div>
      </div>

      {/* Résultat broadcast */}
      {broadcastResult && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-4">
          <p className="text-green-400 font-semibold">✅ {broadcastResult}</p>
          <button onClick={() => setBroadcastResult(null)} className="text-green-300 text-sm mt-1 hover:text-white">Fermer</button>
        </div>
      )}

      {/* Formulaire broadcast */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-white font-semibold mb-4">📢 Diffuser une notification</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Titre de la notification *"
            value={broadcastForm.title}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <textarea
            placeholder="Corps du message *"
            value={broadcastForm.body}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
            rows={3}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="url"
            placeholder="URL de redirection (optionnel)"
            value={broadcastForm.url}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, url: e.target.value })}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => broadcastMutation.mutate(broadcastForm)}
            disabled={broadcastMutation.isPending || !broadcastForm.title || !broadcastForm.body}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {broadcastMutation.isPending ? 'Envoi en cours...' : `📤 Envoyer à ${subscriptions.length} abonné(s)`}
          </button>
        </div>
      </div>

      {/* Liste des abonnés */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h2 className="text-white font-semibold mb-4">Appareils abonnés</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
          </div>
        ) : subscriptions.length === 0 ? (
          <p className="text-slate-400 text-sm">Aucun appareil abonné aux notifications push</p>
        ) : (
          <div className="space-y-2">
            {subscriptions.map((sub, i) => (
              <div key={sub.id || i} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{sub.userAgent || 'Appareil inconnu'}</p>
                  {sub.createdAt && (
                    <p className="text-slate-400 text-xs">Abonné le {new Date(sub.createdAt).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
                <span className="text-green-400 text-xs font-semibold">✅ Actif</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
