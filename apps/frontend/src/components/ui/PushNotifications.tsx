'use client';
import { useState, useEffect } from 'react';

interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  timestamp: Date;
  read: boolean;
  action?: { label: string; href: string };
}

const MOCK_NOTIFICATIONS: PushNotification[] = [
  { id: 'n1', title: 'Alerte stock critique', body: 'Graines tropicales : 12 kg restants (seuil : 20 kg)', icon: '📦', type: 'alert', timestamp: new Date(Date.now() - 15 * 60000), read: false, action: { label: 'Voir le stock', href: '/admin/stock/articles' } },
  { id: 'n2', title: 'Rappel vaccination', body: 'Ara Bleu (E-03) — Rappel Newcastle dans 14 jours', icon: '💉', type: 'warning', timestamp: new Date(Date.now() - 2 * 3600000), read: false, action: { label: 'Voir l\'animal', href: '/admin/animaux/liste' } },
  { id: 'n3', title: 'Permis CITES expiré', body: 'Caïman #3 (R-03) — Permis FR-CITES-2023-015 expiré', icon: '📜', type: 'alert', timestamp: new Date(Date.now() - 24 * 3600000), read: false, action: { label: 'Voir CITES', href: '/admin/cites' } },
  { id: 'n4', title: 'Nouvelle vente confirmée', body: 'VT-2026-023 — Ara ararauna — 1 800 €', icon: '💰', type: 'success', timestamp: new Date(Date.now() - 3 * 3600000), read: true, action: { label: 'Voir la vente', href: '/admin/ventes' } },
  { id: 'n5', title: 'Couvée en cours', body: 'Couvée #C-2026-003 — Jour 12 sur 28 — 4 œufs', icon: '🥚', type: 'info', timestamp: new Date(Date.now() - 6 * 3600000), read: true },
];

const TYPE_STYLES: Record<string, string> = {
  alert: 'border-l-red-500 bg-red-50',
  warning: 'border-l-yellow-500 bg-yellow-50',
  success: 'border-l-green-500 bg-green-50',
  info: 'border-l-blue-500 bg-blue-50',
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)}j`;
}

export function PushNotificationCenter() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied'>('default');

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission as 'default' | 'granted' | 'denied');
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission as 'default' | 'granted' | 'denied');
    setPushEnabled(permission === 'granted');
    if (permission === 'granted') {
      new Notification('🦜 LFTG Platform', {
        body: 'Notifications activées ! Vous recevrez les alertes importantes.',
        icon: '/icon-192.png',
      });
    }
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panneau notifications */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && <p className="text-xs text-gray-400">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-forest-600 hover:text-forest-700 font-medium">
                    Tout marquer lu
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>

            {/* Activation push */}
            {!pushEnabled && (
              <div className="p-3 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔔</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-800">Activer les notifications push</p>
                    <p className="text-xs text-blue-600">Recevez les alertes en temps réel</p>
                  </div>
                  {permissionStatus === 'denied' ? (
                    <span className="text-xs text-red-500">Bloqué</span>
                  ) : (
                    <button
                      onClick={requestPermission}
                      className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Activer
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <div className="text-4xl mb-3">🔕</div>
                  <p className="text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 border-l-4 transition-colors hover:bg-gray-50 ${TYPE_STYLES[notif.type]} ${!notif.read ? 'opacity-100' : 'opacity-70'}`}
                    onClick={() => markRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{notif.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium text-gray-900 ${!notif.read ? 'font-semibold' : ''}`}>
                            {notif.title}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                            className="text-gray-300 hover:text-gray-500 text-xs flex-shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.body}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400">{timeAgo(notif.timestamp)}</span>
                          {notif.action && (
                            <a
                              href={notif.action.href}
                              className="text-xs text-forest-600 hover:text-forest-700 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {notif.action.label} →
                            </a>
                          )}
                          {!notif.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full ml-auto flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 text-center">
              <a href="/admin/history" className="text-xs text-gray-400 hover:text-gray-600">
                Voir tout l'historique →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
