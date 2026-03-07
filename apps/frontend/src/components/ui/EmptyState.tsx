'use client';
import { ReactNode } from 'react';

interface EmptyStateProps {
  /** Grande icône emoji centrale */
  icon?: string;
  /** Titre principal */
  title: string;
  /** Description secondaire */
  description?: string;
  /** Bouton d'action principal */
  action?: ReactNode;
  /** Taille : compact pour les tableaux, full pour les pages entières */
  size?: 'compact' | 'full';
  /** Illustration de fond (emojis décoratifs) */
  decorations?: string[];
}

const DEFAULT_DECORATIONS = ['🌿', '🌺', '🍃', '🦋'];

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  size = 'full',
  decorations = DEFAULT_DECORATIONS,
}: EmptyStateProps) {
  const isCompact = size === 'compact';

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center text-center overflow-hidden
        ${isCompact ? 'py-10 px-6' : 'py-20 px-8'}
        rounded-2xl border-2 border-dashed border-border bg-gradient-to-b from-muted/30 to-transparent
      `}
    >
      {/* Décorations de fond */}
      {!isCompact && decorations.map((d, i) => (
        <span
          key={i}
          className="absolute text-2xl opacity-10 select-none pointer-events-none"
          style={{
            top:  `${[15, 70, 20, 75][i % 4]}%`,
            left: `${[8, 85, 88, 5][i % 4]}%`,
            transform: `rotate(${[-15, 20, -10, 25][i % 4]}deg)`,
          }}
        >
          {d}
        </span>
      ))}

      {/* Icône principale dans un cercle */}
      <div
        className={`
          relative flex items-center justify-center rounded-full
          bg-gradient-to-br from-forest-50 to-forest-100
          border-2 border-forest-200/60 shadow-sm mb-4
          ${isCompact ? 'w-14 h-14 text-3xl' : 'w-20 h-20 text-4xl'}
        `}
      >
        {/* Halo */}
        <div className="absolute inset-0 rounded-full bg-forest-400/5 animate-ping" style={{ animationDuration: '3s' }} />
        <span className="relative">{icon}</span>
      </div>

      {/* Texte */}
      <h3 className={`font-display font-semibold text-foreground mb-1.5 ${isCompact ? 'text-base' : 'text-lg'}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-muted-foreground max-w-xs leading-relaxed ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}

// ── Variantes prédéfinies pour les cas courants ──────────────────────────────

export function EmptyAnimaux({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="🦜"
      title="Aucun animal enregistré"
      description="Commencez par ajouter le premier animal de votre collection. Chaque animal peut être suivi individuellement avec son historique médical et alimentaire."
      decorations={['🐊', '🐢', '🦋', '🌿']}
      action={onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <span>+</span> Ajouter un animal
        </button>
      )}
    />
  );
}

export function EmptyCouvees({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="🥚"
      title="Aucune couvée en cours"
      description="Enregistrez une nouvelle couvée pour suivre l'incubation, les dates de naissance prévues et le taux d'éclosion."
      decorations={['🐣', '🌡️', '🥚', '🌿']}
      action={onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <span>+</span> Nouvelle couvée
        </button>
      )}
    />
  );
}

export function EmptyStock({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="📦"
      title="Stock vide"
      description="Aucun article en stock pour le moment. Ajoutez des articles pour suivre vos consommables, aliments et équipements."
      decorations={['🌿', '💊', '🥕', '🔧']}
      action={onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <span>+</span> Ajouter un article
        </button>
      )}
    />
  );
}

export function EmptyTickets({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="🎫"
      title="Aucun ticket ouvert"
      description="Tout est en ordre ! Aucun ticket d'intervention n'est en cours. Créez un ticket pour signaler un problème ou une tâche à effectuer."
      decorations={['✅', '🔧', '📋', '🌿']}
      action={onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-maroni-600 hover:bg-maroni-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <span>+</span> Créer un ticket
        </button>
      )}
    />
  );
}

export function EmptyFormation({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="🎓"
      title="Aucune formation disponible"
      description="Le catalogue de formations est vide. Ajoutez des cours CCAND, RNCP ou des modules de formation pour vos apprenants."
      decorations={['📚', '✏️', '🏅', '🌿']}
      action={onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <span>+</span> Ajouter une formation
        </button>
      )}
    />
  );
}

export function EmptyRecherche() {
  return (
    <EmptyState
      icon="🔍"
      title="Aucun résultat"
      description="Votre recherche ne correspond à aucun élément. Essayez avec d'autres mots-clés ou réinitialisez les filtres."
      size="compact"
      decorations={[]}
    />
  );
}
