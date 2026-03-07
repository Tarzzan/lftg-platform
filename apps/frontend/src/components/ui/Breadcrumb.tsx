'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

// Mapping segment URL → label lisible + icône emoji
const SEGMENT_MAP: Record<string, { label: string; icon: string }> = {
  admin:       { label: 'Dashboard',          icon: '🏠' },
  animaux:     { label: 'Animaux',             icon: '🦜' },
  liste:       { label: 'Liste',               icon: '📋' },
  especes:     { label: 'Espèces',             icon: '🌿' },
  enclos:      { label: 'Enclos',              icon: '🏡' },
  couvees:     { label: 'Couvées',             icon: '🥚' },
  stock:       { label: 'Stock',               icon: '📦' },
  articles:    { label: 'Articles',            icon: '🗂️' },
  mouvements:  { label: 'Mouvements',          icon: '↔️' },
  demandes:    { label: 'Demandes',            icon: '📬' },
  formation:   { label: 'Formation',           icon: '🎓' },
  cours:       { label: 'Cours',               icon: '📚' },
  cohortes:    { label: 'Cohortes',            icon: '👥' },
  'mon-parcours': { label: 'Mon parcours',     icon: '🗺️' },
  quiz:        { label: 'Quiz',                icon: '❓' },
  emargement:  { label: 'Émargement',          icon: '✍️' },
  qualiopi:    { label: 'Qualiopi',            icon: '🏅' },
  recompenses: { label: 'Récompenses',         icon: '🏆' },
  medical:     { label: 'Médical',             icon: '🏥' },
  calendrier:  { label: 'Calendrier',          icon: '📅' },
  personnel:   { label: 'Personnel',           icon: '👤' },
  employes:    { label: 'Employés',            icon: '🧑‍💼' },
  planning:    { label: 'Planning',            icon: '📆' },
  conges:      { label: 'Congés',              icon: '🏖️' },
  users:       { label: 'Utilisateurs',        icon: '👥' },
  rbac:        { label: 'Rôles & Permissions', icon: '🛡️' },
  workflows:   { label: 'Workflows',           icon: '⚙️' },
  audit:       { label: 'Audit Log',           icon: '📝' },
  import:      { label: 'Import CSV',          icon: '📤' },
  tickets:     { label: 'Tickets',             icon: '🎫' },
  documents:   { label: 'Documents',           icon: '📄' },
  cites:       { label: 'CITES',               icon: '📜' },
  ventes:      { label: 'Ventes',              icon: '🛒' },
  stats:       { label: 'Statistiques',        icon: '📊' },
  tourisme:    { label: 'Tourisme',            icon: '🌍' },
  kiosque:     { label: 'Kiosque',             icon: '🖥️' },
  reports:     { label: 'Rapports',            icon: '📈' },
  settings:    { label: 'Paramètres',          icon: '⚙️' },
  security:    { label: 'Sécurité',            icon: '🔒' },
  gallery:     { label: 'Galerie',             icon: '🖼️' },
  messaging:   { label: 'Messagerie',          icon: '💬' },
  nutrition:   { label: 'Nutrition',           icon: '🥗' },
  elevage:     { label: 'Élevage',             icon: '🐄' },
  genealogy:   { label: 'Généalogie',          icon: '🌳' },
  bi:          { label: 'Business Intelligence', icon: '📉' },
  previsions:  { label: 'Prévisions',          icon: '🔮' },
  export:      { label: 'Export',              icon: '💾' },
  parrainage:  { label: 'Parrainage',          icon: '🤝' },
  partners:    { label: 'Partenaires',         icon: '🏢' },
};

function getSegmentInfo(segment: string): { label: string; icon: string } {
  // Vérifier si c'est un UUID ou un ID numérique
  if (/^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)) {
    return { label: `#${segment.slice(0, 8)}`, icon: '🔍' };
  }
  return SEGMENT_MAP[segment] ?? { label: segment.charAt(0).toUpperCase() + segment.slice(1), icon: '📄' };
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Ne pas afficher si on est exactement sur /admin (dashboard)
  if (segments.length <= 1) return null;

  // Construire les items du fil d'Ariane
  const items = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const info = getSegmentInfo(seg);
    const isLast = i === segments.length - 1;
    return { ...info, path, isLast };
  });

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-sm min-w-0">
      {/* Icône home */}
      <Link
        href="/admin"
        className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-forest-600 hover:bg-forest-50 transition-colors flex-shrink-0"
        aria-label="Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, i) => (
        <span key={item.path} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
          {item.isLast ? (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-forest-50 text-forest-700 font-medium max-w-[160px] truncate">
              <span className="text-xs flex-shrink-0">{item.icon}</span>
              <span className="truncate text-xs">{item.label}</span>
            </span>
          ) : (
            <Link
              href={item.path}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors max-w-[120px] truncate"
            >
              <span className="text-xs flex-shrink-0">{item.icon}</span>
              <span className="truncate text-xs">{item.label}</span>
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
