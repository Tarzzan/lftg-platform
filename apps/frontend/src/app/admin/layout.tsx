'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Shield, GitBranch, ClipboardList, Upload,
  User, Calendar, Award, Archive, ArrowLeftRight, Package,
  Bird, Leaf, Home, Egg, Stethoscope, BookOpen, Users2,
  GraduationCap, HelpCircle, TrendingUp, Trophy, FileText,
  CreditCard, Cloud, Globe, Code2, Calculator, ChevronRight,
  LogOut, Settings, Search, Command, Menu, X, Sparkles, ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { CommandPalette, useCommandPalette } from '@/components/ui/CommandPalette';
import { DemoBanner } from '@/components/DemoBanner';

const navigation = [
  {
    section: 'Tableau de bord',
    emoji: '🏠',
    items: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Administration',
    emoji: '⚙️',
    items: [
      { label: 'Utilisateurs', path: '/admin/users', icon: Users },
      { label: 'Rôles & Permissions', path: '/admin/rbac', icon: Shield },
      { label: 'Workflows', path: '/admin/workflows', icon: GitBranch },
      { label: 'Audit Log', path: '/admin/audit', icon: ClipboardList },
      { label: 'Import CSV', path: '/admin/import', icon: Upload },
    ],
  },
  {
    section: 'Personnel (RH)',
    emoji: '👥',
    items: [
      { label: 'Employés', path: '/admin/personnel/employes', icon: User },
      { label: 'Planning gardes', path: '/admin/personnel/planning', icon: Calendar },
      { label: 'Congés', path: '/admin/personnel/conges', icon: Award },
    ],
  },
  {
    section: 'Stock',
    emoji: '📦',
    items: [
      { label: 'Articles', path: '/admin/stock/articles', icon: Archive },
      { label: 'Mouvements', path: '/admin/stock/mouvements', icon: ArrowLeftRight },
      { label: 'Demandes', path: '/admin/stock/demandes', icon: Package },
    ],
  },
  {
    section: 'Animaux & Couvées',
    emoji: '🦜',
    items: [
      { label: 'Animaux', path: '/admin/animaux/liste', icon: Bird },
      { label: 'Espèces', path: '/admin/animaux/especes', icon: Leaf },
      { label: 'Enclos', path: '/admin/animaux/enclos', icon: Home },
      { label: 'Couvées', path: '/admin/animaux/couvees', icon: Egg },
    ],
  },
  {
    section: 'Médical',
    emoji: '🏥',
    items: [
      { label: 'Suivi médical', path: '/admin/medical', icon: Stethoscope },
      { label: 'Calendrier', path: '/admin/medical/calendrier', icon: Calendar },
    ],
  },
  {
    section: 'Formation',
    emoji: '🎓',
    items: [
      { label: 'Catalogue de cours', path: '/admin/formation/cours', icon: BookOpen },
      { label: 'Cohortes', path: '/admin/formation/cohortes', icon: Users2 },
      { label: 'Mon parcours', path: '/admin/formation/mon-parcours', icon: GraduationCap },
      { label: 'Quiz & Évaluations', path: '/admin/formation/quiz', icon: HelpCircle },
      { label: 'Émargement', path: '/admin/formation/emargement', icon: Award },
      { label: 'Tableau Qualiopi', path: '/admin/formation/qualiopi', icon: TrendingUp },
      { label: 'Mes Récompenses', path: '/admin/formation/recompenses', icon: Trophy },
    ],
  },
  {
    section: 'Documents',
    emoji: '📄',
    items: [
      { label: 'Documents', path: '/admin/documents', icon: FileText },
    ],
  },
  {
    section: 'Finance',
    emoji: '💰',
    items: [
      { label: 'Comptabilité FEC', path: '/admin/accounting', icon: Calculator },
    ],
  },
  {
    section: 'Paiements & Commerce',
    emoji: '💳',
    items: [
      { label: 'Stripe Paiements', path: '/admin/stripe', icon: CreditCard },
      { label: 'Météo Guyane', path: '/admin/meteo', icon: Cloud },
    ],
  },
  {
    section: 'Intégrations',
    emoji: '🔗',
    items: [
      { label: 'API Partenaires', path: '/admin/partners', icon: Globe },
      { label: 'GBIF Biodiversité', path: '/admin/gbif', icon: Leaf },
    ],
  },
  {
    section: 'Développeur',
    emoji: '🛠️',
    items: [
      { label: 'Documentation API', path: '/admin/docs', icon: Code2 },
    ],
  },
];

// Breadcrumb labels mapping
const breadcrumbLabels: Record<string, string> = {
  admin: 'Admin', users: 'Utilisateurs', rbac: 'Rôles', workflows: 'Workflows',
  audit: 'Audit', import: 'Import', personnel: 'Personnel', employes: 'Employés',
  planning: 'Planning', conges: 'Congés', stock: 'Stock', articles: 'Articles',
  mouvements: 'Mouvements', demandes: 'Demandes', animaux: 'Animaux',
  liste: 'Liste', especes: 'Espèces', enclos: 'Enclos', couvees: 'Couvées',
  medical: 'Médical', calendrier: 'Calendrier', formation: 'Formation',
  cours: 'Cours', cohortes: 'Cohortes', quiz: 'Quiz', emargement: 'Émargement',
  qualiopi: 'Qualiopi', recompenses: 'Récompenses', documents: 'Documents',
  accounting: 'Comptabilité', stripe: 'Paiements', meteo: 'Météo',
  partners: 'Partenaires', gbif: 'GBIF', docs: 'Documentation', settings: 'Paramètres',
  'mon-parcours': 'Mon parcours',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { isOpen: cmdOpen, open: openCmd, close: closeCmd } = useCommandPalette();
  const [hydrated, setHydrated] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // État des groupes rétractables : clé = section name, valeur = ouvert/fermé
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setHydrated(true);
    const saved = localStorage.getItem('lftg-sidebar-collapsed');
    if (saved !== null) setCollapsed(saved === 'true');

    // Restaurer l'état des groupes depuis localStorage
    const savedGroups = localStorage.getItem('lftg-sidebar-groups');
    if (savedGroups) {
      try {
        setOpenGroups(JSON.parse(savedGroups));
      } catch {
        // Initialiser avec la section active ouverte
        initOpenGroups(pathname);
      }
    } else {
      initOpenGroups(pathname);
    }
  }, []);

  // Ouvre uniquement le groupe contenant la page active (+ Tableau de bord)
  const initOpenGroups = (path: string) => {
    const initial: Record<string, boolean> = {};
    navigation.forEach((group) => {
      const hasActive = group.items.some(
        item => path === item.path || (item.path !== '/admin' && path.startsWith(item.path))
      );
      // N'ouvrir que le groupe actif (Tableau de bord toujours ouvert car c'est la page /admin)
      initial[group.section] = hasActive;
    });
    setOpenGroups(initial);
  };

  // Ouvrir automatiquement le groupe de la page active lors d'un changement de route
  useEffect(() => {
    if (!hydrated) return;
    setOpenGroups(prev => {
      const next = { ...prev };
      navigation.forEach((group) => {
        const hasActive = group.items.some(
          item => pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path))
        );
        if (hasActive) next[group.section] = true;
      });
      return next;
    });
  }, [pathname, hydrated]);

  const toggleGroup = (section: string) => {
    setOpenGroups(prev => {
      const next = { ...prev, [section]: !prev[section] };
      localStorage.setItem('lftg-sidebar-groups', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (hydrated && !user) router.push('/login');
  }, [user, router, hydrated]);

  if (!hydrated) return null;
  if (!user) return null;

  const handleLogout = () => {
    clearAuth();
    document.cookie = 'lftg_session=; path=/; max-age=0';
    router.push('/login');
  };

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('lftg-sidebar-collapsed', String(next));
  };

  // Breadcrumb segments
  const segments = pathname.split('/').filter(Boolean);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f2ed] dark:bg-[#0d1a0f]">
      <CommandPalette isOpen={cmdOpen} onClose={closeCmd} />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ═══════════════════════════════════════════
          SIDEBAR — Thème forêt tropicale premium
          ═══════════════════════════════════════════ */}
      <aside
        role="navigation"
        aria-label="Navigation principale"
        className={`
          fixed lg:relative z-50 lg:z-auto
          flex-shrink-0 flex flex-col h-full
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          backgroundImage: 'url(/sidebar-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          boxShadow: '4px 0 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Overlay sombre pour lisibilité du texte */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(4,18,9,0.85) 0%, rgba(8,30,15,0.78) 40%, rgba(4,18,9,0.90) 100%)',
          }}
        />

        {/* Logo / Header */}
        <div
          className={`relative flex items-center flex-shrink-0 border-b border-white/10 ${collapsed ? 'justify-center p-3' : 'px-4 py-4 gap-3'}`}
          style={{ minHeight: '64px' }}
        >
          {/* Logo pécari */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
            style={{
              background: 'linear-gradient(135deg, #c17f3a, #e8a84e)',
              boxShadow: '0 2px 8px rgba(193,127,58,0.4)',
            }}
          >
            🐗
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate" style={{ fontFamily: 'Georgia, serif' }}>
                La Ferme Tropicale
              </p>
              <p className="text-white/50 text-[10px] truncate">de Guyane — Admin</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="ml-auto text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          {collapsed && (
            <button
              onClick={toggleSidebar}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#c17f3a] flex items-center justify-center shadow-lg text-white hover:bg-[#d4924a] transition-colors z-10"
            >
              <ChevronRight className={`w-3 h-3 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
          {navigation.map((group) => {
            const isGroupOpen = openGroups[group.section] ?? true;
            const hasActiveItem = group.items.some(
              item => pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path))
            );

            return (
              <div key={group.section} className="mb-0.5">
                {/* En-tête de groupe — cliquable pour rétracter */}
                {!collapsed ? (
                  <button
                    onClick={() => toggleGroup(group.section)}
                    className={`
                      w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mt-1.5 mb-0.5
                      transition-all duration-150 group/header
                      ${hasActiveItem
                        ? 'bg-white/10 hover:bg-white/15'
                        : 'hover:bg-white/8'
                      }
                    `}
                  >
                    <span
                      className="inline-flex items-center gap-1.5 flex-1 text-[9px] font-bold uppercase tracking-widest"
                      style={{
                        color: hasActiveItem ? 'rgba(232,168,78,0.95)' : 'rgba(255,255,255,0.7)',
                        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                      }}
                    >
                      <span>{group.emoji}</span>
                      <span className="truncate">{group.section}</span>
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isGroupOpen ? 'rotate-0' : '-rotate-90'}`}
                      style={{ color: hasActiveItem ? 'rgba(232,168,78,0.8)' : 'rgba(255,255,255,0.35)' }}
                    />
                  </button>
                ) : (
                  <div className="my-2 border-t border-white/10" />
                )}

                {/* Items du groupe — animés */}
                <div
                  className="overflow-hidden transition-all duration-200 ease-in-out"
                  style={{
                    maxHeight: (!collapsed && isGroupOpen) || collapsed ? '500px' : '0px',
                    opacity: (!collapsed && isGroupOpen) || collapsed ? 1 : 0,
                  }}
                >
                  <div className="space-y-0.5 pb-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          title={collapsed ? item.label : undefined}
                          onClick={() => setMobileOpen(false)}
                          className={`
                            relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium
                            transition-all duration-150 group
                            ${collapsed ? 'justify-center px-0 py-2.5' : ''}
                            ${isActive
                              ? 'text-white'
                              : 'text-white/60 hover:text-white/90 hover:bg-white/8'
                            }
                          `}
                          style={isActive ? {
                            background: 'linear-gradient(90deg, rgba(193,127,58,0.25), rgba(193,127,58,0.08))',
                            borderLeft: '2px solid #c17f3a',
                          } : {}}
                        >
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r"
                              style={{ background: '#c17f3a' }}
                            />
                          )}
                          <Icon className={`flex-shrink-0 transition-transform group-hover:scale-110 ${collapsed ? 'w-5 h-5' : 'w-3.5 h-3.5'} ${isActive ? 'text-[#e8a84e]' : ''}`} />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                          {!collapsed && isActive && (
                            <ChevronRight className="w-3 h-3 ml-auto text-[#c17f3a] flex-shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="flex-shrink-0 p-3 border-t border-white/10">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #c17f3a, #e8a84e)' }}
                title={user.name || user.email}
              >
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="text-white/40 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #c17f3a, #e8a84e)', boxShadow: '0 2px 8px rgba(193,127,58,0.3)' }}
              >
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user.name || user.email}</p>
                <p className="text-[10px] text-white/40 truncate">{user.roles?.[0] || 'Utilisateur'}</p>
              </div>
              <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition-colors" title="Se déconnecter">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT AREA
          ═══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DemoBanner />

        {/* ─── Top bar ─── */}
        <header
          className="h-14 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 border-b"
          style={{
            background: 'rgba(245,242,237,0.95)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(26,71,49,0.12)',
          }}
        >
          {/* Left: mobile menu + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-forest-700 hover:bg-forest-50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-xs">
              {segments.map((seg, i) => {
                const isLast = i === segments.length - 1;
                const label = breadcrumbLabels[seg] || seg;
                return (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="w-3 h-3 text-forest-300" />}
                    <span
                      className={`${isLast
                        ? 'font-semibold text-forest-800 dark:text-forest-300'
                        : 'text-forest-400 dark:text-forest-500'
                      }`}
                    >
                      {label}
                    </span>
                  </span>
                );
              })}
            </nav>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={openCmd}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 hover:scale-[1.02]"
              style={{
                background: 'rgba(26,71,49,0.06)',
                border: '1px solid rgba(26,71,49,0.12)',
                color: '#1a4731',
              }}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-forest-600">Rechercher</span>
              <kbd
                className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px]"
                style={{ background: 'rgba(26,71,49,0.08)', border: '1px solid rgba(26,71,49,0.15)' }}
              >
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>

            <NotificationBell />
            <ThemeToggle />

            <Link
              href="/admin/settings"
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(26,71,49,0.06)', border: '1px solid rgba(26,71,49,0.12)', color: '#1a4731' }}
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Lien vers le site public */}
            <Link
              href="/public"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #1a4731, #2d7d7d)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(26,71,49,0.25)',
              }}
              target="_blank"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Site public
            </Link>
          </div>
        </header>

        {/* ─── Page content ─── */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            background: 'linear-gradient(180deg, #f5f2ed 0%, #f0ede8 100%)',
          }}
        >
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
