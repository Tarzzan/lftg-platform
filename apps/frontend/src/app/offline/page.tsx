"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🦜</div>
        <h1 className="text-2xl font-display font-bold text-forest-800 mb-3">
          Vous êtes hors ligne
        </h1>
        <p className="text-forest-600 mb-6">
          LFTG Platform nécessite une connexion internet pour fonctionner. 
          Vérifiez votre connexion et réessayez.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-forest-600 text-white rounded-xl font-semibold hover:bg-forest-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
