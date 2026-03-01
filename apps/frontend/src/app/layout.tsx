import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'LFTG Platform | La Ferme Tropicale de Guyane',
  description: 'Plateforme de gestion intégrée pour La Ferme Tropicale de Guyane : animaux, stock, personnel, formations et workflows.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LFTG Platform',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  keywords: ['ferme tropicale', 'guyane', 'gestion', 'animaux', 'biodiversité'],
  authors: [{ name: 'LFTG Team' }],
  creator: 'LFTG Platform',
  publisher: 'La Ferme Tropicale de Guyane',
  robots: 'noindex, nofollow', // Application privée
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#166534' },
    { media: '(prefers-color-scheme: dark)', color: '#14532d' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LFTG" />
      </head>
      <body>
        <Providers>{children}</Providers>
        {/* Enregistrement du Service Worker */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('[LFTG] Service Worker enregistré:', registration.scope);
                  })
                  .catch(function(error) {
                    console.warn('[LFTG] Service Worker non enregistré:', error);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
