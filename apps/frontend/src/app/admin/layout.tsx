'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, Shield, GitBranch, Package, Bird, GraduationCap,
  ClipboardList, Settings, LogOut, Bell, ChevronRight, Leaf, Egg, BookOpen,
  Archive, ArrowLeftRight, User, Award, Home,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

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
    ],
  },
  {
    section: 'Personnel (RH)',
    items: [
      { label: 'Employés', path: '/admin/personnel/employes', icon: User },
      { label: 'Compétences', path: '/admin/personnel/competences', icon: Award },
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
    section: 'Formation',
    items: [
      { label: 'Cours', path: '/admin/formation/cours', icon: BookOpen },
      { label: 'Mes formations', path: '/admin/formation/mes-formations', icon: GraduationCap },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

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
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-border flex flex-col">
        {/* Brand */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-jungle-gradient flex items-center justify-center text-xl flex-shrink-0">
              🦜
            </div>
            <div className="min-w-0">
              <p className="text-sm font-display font-bold text-foreground truncate">LFTG Platform</p>
              <p className="text-xs text-muted-foreground truncate">Guyane</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navigation.map((group) => (
            <div key={group.section}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-wood-400">
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
              <p className="text-[10px] text-muted-foreground truncate">{user.roles[0] || 'Utilisateur'}</p>
            </div>
            <button onClick={handleLogout} className="text-wood-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {pathname.split('/').filter(Boolean).map((segment, i, arr) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={i === arr.length - 1 ? 'text-foreground font-medium' : ''}>
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-wood-500 hover:text-foreground">
              <Bell className="w-4 h-4" />
            </button>
            <Link href="/admin/settings" className="p-2 rounded-lg hover:bg-muted transition-colors text-wood-500 hover:text-foreground">
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
