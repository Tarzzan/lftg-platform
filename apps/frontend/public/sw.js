/**
 * LFTG Platform — Service Worker v3.0.0
 * Stratégie : Network First avec fallback cache pour les assets statiques
 */

const CACHE_NAME = 'lftg-v3.0.0';
const OFFLINE_URL = '/offline';

// Assets à mettre en cache immédiatement
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
];

// ─── Installation ─────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Précache des assets LFTG');
      return cache.addAll(PRECACHE_ASSETS.filter(url => {
        // Ne pas échouer si certains assets n'existent pas encore
        return true;
      })).catch(err => console.warn('[SW] Précache partiel:', err));
    })
  );
  self.skipWaiting();
});

// ─── Activation ───────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et les APIs
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  // Stratégie Network First pour les pages
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Mettre en cache la réponse
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          // Fallback vers le cache
          const cached = await caches.match(request);
          if (cached) return cached;
          // Fallback vers la page offline
          return caches.match(OFFLINE_URL) || new Response('Hors ligne', { status: 503 });
        })
    );
    return;
  }

  // Stratégie Cache First pour les assets statiques (JS, CSS, images)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return response;
        });
      })
    );
    return;
  }
});

// ─── Push notifications ───────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.message || data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/admin' },
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'dismiss', title: 'Ignorer' },
    ],
    tag: data.type || 'lftg-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'LFTG Platform', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/admin';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
