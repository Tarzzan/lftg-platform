export function ErrorState({ title = "Erreur de chargement", message = "Impossible de charger les données. Vérifiez votre connexion et réessayez.", onRetry, icon = "⚠️" }: { title?: string; message?: string; onRetry?: () => void; icon?: string; }) {
  return (
    <div className="flex items-center justify-center min-h-[300px] p-8">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 transition-colors">
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title = "Aucune donnée", message = "Rien à afficher pour le moment.", icon = "📭", action }: { title?: string; message?: string; icon?: string; action?: { label: string; onClick: () => void }; }) {
  return (
    <div className="flex items-center justify-center min-h-[200px] p-8">
      <div className="text-center max-w-sm">
        <span className="text-4xl mb-4 block">{icon}</span>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{message}</p>
        {action && (
          <button onClick={action.onClick} className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 transition-colors">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
