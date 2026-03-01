import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 via-white to-maroni-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="text-8xl mb-4 animate-bounce">🦜</div>
          <div className="absolute -top-2 -right-4 text-4xl opacity-50 rotate-12">🌿</div>
          <div className="absolute -bottom-2 -left-4 text-3xl opacity-40 -rotate-12">🌺</div>
        </div>

        {/* Code d'erreur */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-full mb-6">
          <span className="text-red-500 font-mono font-bold text-sm">404</span>
          <span className="text-red-500 text-sm">Page introuvable</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Cette page s'est envolée
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          La page que vous cherchez n'existe pas ou a été déplacée.
          Revenez au tableau de bord pour continuer.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/admin"
            className="px-6 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 transition-colors"
          >
            ← Tableau de bord
          </Link>
          <Link
            href="/admin/animaux/liste"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Voir les animaux
          </Link>
        </div>
      </div>
    </div>
  );
}
