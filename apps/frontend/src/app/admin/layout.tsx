'use client';
import DemoBanner from '@/components/DemoBanner';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, Shield, GitBranch, Package, Bird, GraduationCap,
  ClipboardList, Settings, LogOut, ChevronRight, Leaf, Egg, BookOpen,
  Archive, ArrowLeftRight, User, Award, Home, Users2, Stethoscope,
  Calendar, Upload, Search, Command, ShoppingCart, FileText, Code2,
  MessageSquare, BarChart3, Ticket, Dna, Calculator, MapPin, Monitor,
  HelpCircle, TrendingUp, Globe, CreditCard, Cloud, Trophy, Medal, Star,
  PanelLeftClose, PanelLeftOpen, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { CommandPalette, useCommandPalette } from '@/components/ui/CommandPalette';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

const navigation = [
  {
    section: 'Tableau de bord',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Administration',
    icon: Shield,
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
    icon: User,
    items: [
      { label: 'Employés', path: '/admin/personnel/employes', icon: User },
      { label: 'Planning gardes', path: '/admin/personnel/planning', icon: Calendar },
      { label: 'Congés', path: '/admin/personnel/conges', icon: Award },
    ],
  },
  {
    section: 'Stock',
    icon: Archive,
    items: [
      { label: 'Articles', path: '/admin/stock/articles', icon: Archive },
      { label: 'Mouvements', path: '/admin/stock/mouvements', icon: ArrowLeftRight },

    ],
  },
  {
    section: 'Animaux & Couvées',
    icon: Bird,
    items: [
      { label: 'Animaux', path: '/admin/animaux/liste', icon: Bird },
      { label: 'Espèces', path: '/admin/animaux/especes', icon: Leaf },
      { label: 'Enclos', path: '/admin/animaux/enclos', icon: Home },
      { label: 'Couvées', path: '/admin/animaux/couvees', icon: Egg },
    ],
  },
  {
    section: 'Médical',
    icon: Stethoscope,
    items: [
      { label: 'Suivi médical', path: '/admin/medical', icon: Stethoscope },
      { label: 'Calendrier', path: '/admin/medical/calendrier', icon: Calendar },
    ],
  },
  {
    section: 'Formation',
    icon: GraduationCap,
    items: [
      { label: 'Catalogue de cours', path: '/admin/formation/cours', icon: BookOpen },
      { label: 'Cohortes', path: '/admin/formation/cohortes', icon: Users2 },
      { label: 'Mon parcours', path: '/admin/formation/mon-parcours', icon: GraduationCap },
      { label: 'Quiz & Évaluations', path: '/admin/formation/quiz', icon: HelpCircle },
      { label: 'Émargement', path: '/admin/formation/emargement', icon: Award },
      { label: 'Tableau Qualiopi', path: '/admin/formation/qualiopi', icon: TrendingUp },
      { label: 'Satisfaction', path: '/admin/formation/satisfaction', icon: Star },
      { label: 'Mes Récompenses', path: '/admin/formation/recompenses', icon: Trophy },
    ],
  },

  {
    section: 'Ventes',
    icon: ShoppingCart,
    items: [
      { label: 'Toutes les ventes', path: '/admin/ventes', icon: ShoppingCart },
      { label: 'Statistiques', path: '/admin/ventes/stats', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Conformité & Docs',
    icon: FileText,
    items: [
      { label: 'CITES', path: '/admin/cites', icon: FileText },
      { label: 'Documents', path: '/admin/documents', icon: Archive },
    ],
  },
  {
    section: 'Outils',
    icon: Calendar,
    items: [
      { label: 'Agenda (mois)', path: '/admin/agenda', icon: Calendar },
      { label: 'Agenda (semaine)', path: '/admin/agenda/semaine', icon: Calendar },
      { label: 'Rapports PDF', path: '/admin/reports', icon: FileText },
      { label: 'Historique', path: '/admin/history', icon: ClipboardList },
    ],
  },
  {
    section: 'Élevage & Génétique',
    icon: Dna,
    items: [
      { label: 'Couples & Élevage', path: '/admin/elevage', icon: Dna },
    ],
  },
  {
    section: 'Communication',
    icon: MessageSquare,
    items: [
      { label: 'Messagerie', path: '/admin/messaging', icon: MessageSquare },
      { label: 'Tickets & Incidents', path: '/admin/tickets', icon: Ticket },
    ],
  },

  {
    section: 'Météo',
    icon: Cloud,
    items: [
      { label: 'Météo Guyane', path: '/admin/meteo', icon: Cloud },
    ],
  },
  {
    section: 'Intégrations',
    icon: Globe,
    items: [
      { label: 'API Partenaires', path: '/admin/partners', icon: Globe },
      { label: 'GBIF Biodiversité', path: '/admin/gbif', icon: Leaf },
    ],
  },

];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { isOpen: cmdOpen, open: openCmd, close: closeCmd } = useCommandPalette();
  const [hydrated, setHydrated] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !user) router.push('/login');
  }, [user, router, hydrated]);

  // Fermer le drawer mobile lors d'un changement de route
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!hydrated) return null;
  if (!user) return null;

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-4 border-b border-border flex items-center justify-between">
          <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-[#f5f0e8]">
            <img src="/lftg_improved_v1.png" alt="Logo LFTG" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-display font-bold text-foreground truncate">LFTG Platform</p>
              <p className="text-xs text-muted-foreground truncate">La Ferme Tropicale</p>
            </div>
          )}
        </div>
        {/* Bouton toggle collapse — desktop uniquement */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
            title="Réduire le menu"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Bouton expand quand réduit */}
      {collapsed && (
        <div className="px-2 pt-2 hidden md:flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Étendre le menu"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recherche rapide — masquée en mode réduit */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={openCmd}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors text-sm"
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 text-left text-xs">Rechercher...</span>
            <kbd className="flex items-center gap-0.5 text-[10px] bg-background border border-border rounded px-1 py-0.5">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        </div>
      )}

      {/* Icône recherche en mode réduit */}
      {collapsed && (
        <div className="px-2 pt-2 flex justify-center">
          <button
            onClick={openCmd}
            className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Rechercher (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 mt-2">
        {navigation.map((group, groupIndex) => {
          const SectionIcon = group.icon;
          const isGroupActive = group.items.some(
            (item) => pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path))
          );

          return (
            <div key={group.section} className={groupIndex > 0 ? 'pt-1' : ''}>
              {/* Titre de section — mode étendu */}
              {!collapsed && (
                <div className={`flex items-center gap-2 px-2 py-1.5 mb-1 rounded-md ${isGroupActive ? 'bg-forest-50 dark:bg-forest-950/30' : ''}`}>
                  <div className={`w-0.5 h-4 rounded-full flex-shrink-0 ${isGroupActive ? 'bg-forest-500' : 'bg-border'}`} />
                  <SectionIcon className={`w-3 h-3 flex-shrink-0 ${isGroupActive ? 'text-forest-600' : 'text-muted-foreground/60'}`} />
                  <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${isGroupActive ? 'text-forest-700 dark:text-forest-400' : 'text-muted-foreground/70'}`}>
                    {group.section}
                  </p>
                </div>
              )}

              {/* Mode réduit : séparateur + icône de section comme repère */}
              {collapsed && groupIndex > 0 && (
                <div className="flex justify-center py-1">
                  <div className="w-6 h-px bg-border" />
                </div>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      title={collapsed ? item.label : undefined}
                      className={`sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0 w-9 h-9 mx-auto' : ''}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {isActive && <ChevronRight className="w-3 h-3 ml-auto text-forest-600" />}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-semibold text-sm cursor-default"
              title={user.name || user.email}
            >
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-red-500 transition-colors" title="Se déconnecter">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
            <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-semibold text-sm flex-shrink-0">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">{user.name || user.email}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.roles?.[0] || 'Utilisateur'}</p>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-red-500 transition-colors" title="Se déconnecter">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={closeCmd} />

      {/* ── Overlay mobile ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar desktop (fixe, rétractable) ── */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 bg-card border-r border-border transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Sidebar mobile (drawer) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-card border-r border-border shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Bouton fermer drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-3 w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DemoBanner />
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Burger mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumb />
          </div>
          <div className="flex items-center gap-2">
            {/* Bouton recherche dans la topbar */}
            <button
              onClick={openCmd}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors text-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Rechercher</span>
              <kbd className="flex items-center gap-0.5 bg-background border border-border rounded px-1 py-0.5 text-[10px]">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>
            <NotificationBell />
            <ThemeToggle />
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted text-muted-foreground cursor-not-allowed opacity-50" title="Paramètres (bientôt disponible)">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
