'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, Shield, GitBranch, Package, Bird, GraduationCap,
  ClipboardList, Settings, LogOut, ChevronRight, Leaf, Egg, BookOpen,
  Archive, ArrowLeftRight, User, Award, Home, Users2, Stethoscope,
  Calendar, Upload, Search, Command, ShoppingCart, FileText, Code2,
  MessageSquare, BarChart3, Ticket, Dna, Calculator, MapPin, Monitor,
  HelpCircle, TrendingUp, Globe, CreditCard, Cloud,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { CommandPalette, useCommandPalette } from '@/components/ui/CommandPalette';

const navigation = [
  {
    section: 'Tableau de bord',
    items: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Administration',
    items: [
      { label: 'Utilisateurs', path: '/admin/users', icon: Users },
      { label: 'Rôles & Permissions', path: '/admin/roles', icon: Shield },
      { label: 'Workflows', path: '/admin/workflows', icon: GitBranch },
      { label: 'Audit Log', path: '/admin/audit', icon: ClipboardList },
      { label: 'Import CSV', path: '/admin/import', icon: Upload },
    ],
  },
  {
    section: 'Personnel (RH)',
    items: [
      { label: 'Employés', path: '/admin/personnel/employes', icon: User },
      { label: 'Planning gardes', path: '/admin/personnel/planning', icon: Calendar },
      { label: 'Congés', path: '/admin/personnel/conges', icon: Award },
    ],
  },
  {
    section: 'Stock',
    items: [
      { label: 'Articles', path: '/admin/stock/articles', icon: Archive },
      { label: 'Mouvements', path: '/admin/stock/mouvements', icon: ArrowLeftRight },
      { label: 'Demandes', path: '/admin/stock/demandes', icon: Package },
    ],
  },
  {
    section: 'Animaux & Couvées',
    items: [
      { label: 'Animaux', path: '/admin/animaux/liste', icon: Bird },
      { label: 'Espèces', path: '/admin/animaux/especes', icon: Leaf },
      { label: 'Enclos', path: '/admin/animaux/enclos', icon: Home },
      { label: 'Couvées', path: '/admin/animaux/couvees', icon: Egg },
    ],
  },
  {
    section: 'Médical',
    items: [
      { label: 'Suivi médical', path: '/admin/medical', icon: Stethoscope },
      { label: 'Calendrier', path: '/admin/medical/calendrier', icon: Calendar },
    ],
  },
  {
    section: 'Formation',
    items: [
      { label: 'Catalogue de cours', path: '/admin/formation/cours', icon: BookOpen },
      { label: 'Cohortes', path: '/admin/formation/cohortes', icon: Users2 },
      { label: 'Mon parcours', path: '/admin/formation/mon-parcours', icon: GraduationCap },
      { label: 'Quiz & Évaluations', path: '/admin/formation/quiz', icon: HelpCircle },
      { label: 'Émargement', path: '/admin/formation/emargement', icon: Award },
      { label: 'Tableau Qualiopi', path: '/admin/formation/qualiopi', icon: TrendingUp },
    ],
  },
  {
    section: 'Tourisme & Kiosque',
    items: [
      { label: 'Visites guidées', path: '/admin/tourisme', icon: Globe },
      { label: 'Mode Kiosque', path: '/admin/kiosque', icon: Monitor },
    ],
  },
  {
    section: 'Ventes',
    items: [
      { label: 'Toutes les ventes', path: '/admin/ventes', icon: ShoppingCart },
      { label: 'Statistiques', path: '/admin/ventes/stats', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Conformité & Docs',
    items: [
      { label: 'CITES', path: '/admin/cites', icon: FileText },
      { label: 'Documents', path: '/admin/documents', icon: Archive },
    ],
  },
  {
    section: 'Outils',
    items: [
      { label: 'Agenda (mois)', path: '/admin/agenda', icon: Calendar },
      { label: 'Agenda (semaine)', path: '/admin/agenda/semaine', icon: Calendar },
      { label: 'Rapports PDF', path: '/admin/reports', icon: FileText },
      { label: 'Historique', path: '/admin/history', icon: ClipboardList },
    ],
  },
  {
    section: 'Élevage & Génétique',
    items: [
      { label: 'Couples & Élevage', path: '/admin/elevage', icon: Dna },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Messagerie', path: '/admin/messaging', icon: MessageSquare },
      { label: 'Tickets & Incidents', path: '/admin/tickets', icon: Ticket },
    ],
  },
  {
    section: 'Analytique',
    items: [
      { label: 'Tableau de bord BI', path: '/admin/bi', icon: BarChart3 },
      { label: 'Prévisions', path: '/admin/bi/previsions', icon: TrendingUp },
      { label: 'Comptabilité FEC', path: '/admin/accounting', icon: Calculator },
    ],
  },
  {
    section: 'Paiements & Commerce',
    items: [
      { label: 'Stripe Paiements', path: '/admin/stripe', icon: CreditCard },
      { label: 'Météo Guyane', path: '/admin/meteo', icon: Cloud },
    ],
  },
  {
    section: 'Intégrations',
    items: [
      { label: 'API Partenaires', path: '/admin/partners', icon: Globe },
      { label: 'GBIF Biodiversité', path: '/admin/gbif', icon: Leaf },
    ],
  },
  {
    section: 'Développeur',
    items: [
      { label: 'Documentation API', path: '/admin/docs', icon: Code2 },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { isOpen: cmdOpen, open: openCmd, close: closeCmd } = useCommandPalette();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={closeCmd} />

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
        {/* Brand */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-jungle-gradient flex items-center justify-center text-xl flex-shrink-0">
              🦜
            </div>
            <div className="min-w-0">
              <p className="text-sm font-display font-bold text-foreground truncate">LFTG Platform</p>
              <p className="text-xs text-muted-foreground truncate">La Ferme Tropicale</p>
            </div>
          </div>
        </div>

        {/* Recherche rapide */}
        <div className="px-3 pt-3">
          <button
            onClick={openCmd}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors text-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left text-xs">Rechercher...</span>
            <kbd className="flex items-center gap-0.5 text-[10px] bg-background border border-border rounded px-1 py-0.5">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 mt-2">
          {navigation.map((group) => (
            <div key={group.section}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {isActive && <ChevronRight className="w-3 h-3 ml-auto text-forest-600" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
            <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-semibold text-sm flex-shrink-0">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">{user.name || user.email}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.roles?.[0] || 'Utilisateur'}</p>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {pathname.split('/').filter(Boolean).map((segment, i, arr) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={i === arr.length - 1 ? 'text-foreground font-medium capitalize' : 'capitalize'}>
                  {segment}
                </span>
              </span>
            ))}
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
            <Link href="/admin/settings" className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-4 h-4" />
            </Link>
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
