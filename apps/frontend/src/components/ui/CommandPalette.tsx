'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Bird, Package, Users, BookOpen, Stethoscope,
  GitBranch, BarChart2, Settings, ArrowRight, Command,
  Plus, FileText, Bell, LogOut, Moon, Sun,
} from 'lucide-react';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  type: 'animal' | 'article' | 'user' | 'cours' | 'workflow' | 'page' | 'action';
  label: string;
  sublabel?: string;
  href?: string;
  action?: () => void;
  icon: React.ReactNode;
  badge?: string;
}

// ─── Pages statiques ──────────────────────────────────────────────────────────

const STATIC_PAGES: SearchResult[] = [
  { id: 'dashboard', type: 'page', label: 'Tableau de bord', sublabel: 'Vue d\'ensemble', href: '/admin', icon: <BarChart2 className="w-4 h-4 text-forest-600" /> },
  { id: 'animaux', type: 'page', label: 'Animaux', sublabel: 'Liste des animaux', href: '/admin/animaux/liste', icon: <Bird className="w-4 h-4 text-forest-600" /> },
  { id: 'especes', type: 'page', label: 'Espèces', sublabel: 'Gestion des espèces', href: '/admin/animaux/especes', icon: <Bird className="w-4 h-4 text-forest-600" /> },
  { id: 'couvees', type: 'page', label: 'Couvées', sublabel: 'Suivi des couvées', href: '/admin/animaux/couvees', icon: <Bird className="w-4 h-4 text-maroni-600" /> },
  { id: 'medical', type: 'page', label: 'Suivi médical', sublabel: 'Visites vétérinaires', href: '/admin/medical', icon: <Stethoscope className="w-4 h-4 text-laterite-600" /> },
  { id: 'stock', type: 'page', label: 'Stock', sublabel: 'Articles en stock', href: '/admin/stock/articles', icon: <Package className="w-4 h-4 text-amber-600" /> },
  { id: 'users', type: 'page', label: 'Utilisateurs', sublabel: 'Gestion des comptes', href: '/admin/users', icon: <Users className="w-4 h-4 text-blue-600" /> },
  { id: 'formation', type: 'page', label: 'Formation', sublabel: 'Cours et cohortes', href: '/admin/formation/cours', icon: <BookOpen className="w-4 h-4 text-purple-600" /> },
  { id: 'workflows', type: 'page', label: 'Workflows', sublabel: 'Processus métier', href: '/admin/workflows', icon: <GitBranch className="w-4 h-4 text-forest-600" /> },
  { id: 'audit', type: 'page', label: 'Journal d\'audit', sublabel: 'Historique des actions', href: '/admin/audit', icon: <FileText className="w-4 h-4 text-gray-600" /> },
];

const QUICK_ACTIONS: SearchResult[] = [
  { id: 'new-animal', type: 'action', label: 'Nouvel animal', sublabel: 'Créer une fiche animal', href: '/admin/animaux/liste?new=1', icon: <Plus className="w-4 h-4 text-forest-600" />, badge: 'Action' },
  { id: 'new-visit', type: 'action', label: 'Nouvelle visite médicale', sublabel: 'Enregistrer une visite', href: '/admin/medical?new=1', icon: <Plus className="w-4 h-4 text-laterite-600" />, badge: 'Action' },
  { id: 'new-workflow', type: 'action', label: 'Créer un workflow', sublabel: 'Éditeur visuel', href: '/admin/workflows/editor', icon: <Plus className="w-4 h-4 text-maroni-600" />, badge: 'Action' },
  { id: 'import-csv', type: 'action', label: 'Importer un CSV', sublabel: 'Animaux, stock, utilisateurs', href: '/admin/import', icon: <FileText className="w-4 h-4 text-amber-600" />, badge: 'Action' },
];

// ─── Composant ────────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Recherche API
  const { data: apiResults = [] } = useQuery<SearchResult[]>({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const [animals, articles] = await Promise.allSettled([
        api.get(`/animaux-couvees/animals?search=${encodeURIComponent(query)}&limit=5`).then(r => r.data),
        api.get(`/stock/articles?search=${encodeURIComponent(query)}&limit=5`).then(r => r.data),
      ]);

      const results: SearchResult[] = [];

      if (animals.status === 'fulfilled') {
        (animals.value?.data || animals.value || []).slice(0, 5).forEach((a: any) => {
          results.push({
            id: `animal-${a.id}`,
            type: 'animal',
            label: a.name,
            sublabel: a.species?.name || 'Animal',
            href: `/admin/animaux/${a.id}`,
            icon: <Bird className="w-4 h-4 text-forest-600" />,
            badge: 'Animal',
          });
        });
      }

      if (articles.status === 'fulfilled') {
        (articles.value?.data || articles.value || []).slice(0, 5).forEach((a: any) => {
          results.push({
            id: `article-${a.id}`,
            type: 'article',
            label: a.name,
            sublabel: `${a.quantity} ${a.unit} en stock`,
            href: `/admin/stock/articles`,
            icon: <Package className="w-4 h-4 text-amber-600" />,
            badge: 'Stock',
          });
        });
      }

      return results;
    },
    enabled: query.length >= 2,
  });

  // Filtrage des résultats statiques
  const filteredPages = query.length > 0
    ? STATIC_PAGES.filter(p =>
        p.label.toLowerCase().includes(query.toLowerCase()) ||
        p.sublabel?.toLowerCase().includes(query.toLowerCase())
      )
    : STATIC_PAGES.slice(0, 6);

  const filteredActions = query.length > 0
    ? QUICK_ACTIONS.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.sublabel?.toLowerCase().includes(query.toLowerCase())
      )
    : QUICK_ACTIONS;

  // Tous les résultats combinés
  const allResults: Array<{ section: string; items: SearchResult[] }> = [];
  if (apiResults.length > 0) allResults.push({ section: 'Résultats', items: apiResults });
  if (filteredActions.length > 0) allResults.push({ section: 'Actions rapides', items: filteredActions });
  if (filteredPages.length > 0) allResults.push({ section: 'Navigation', items: filteredPages });

  const flatResults = allResults.flatMap(s => s.items);

  // Navigation clavier
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, flatResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flatResults[selectedIndex];
        if (selected) {
          if (selected.href) { router.push(selected.href); onClose(); }
          else if (selected.action) { selected.action(); onClose(); }
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, flatResults, selectedIndex, router, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  if (!isOpen) return null;

  let globalIdx = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Palette */}
      <div className="relative w-full max-w-xl mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un animal, article, page..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
          />
          <kbd className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
            <span>ESC</span>
          </kbd>
        </div>

        {/* Résultats */}
        <div className="max-h-96 overflow-y-auto py-2">
          {allResults.length === 0 && query.length >= 2 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucun résultat pour « {query} »
            </div>
          ) : (
            allResults.map(section => (
              <div key={section.section}>
                <p className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.section}
                </p>
                {section.items.map(item => {
                  const idx = globalIdx++;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? 'bg-forest-50 text-forest-700' : 'hover:bg-muted text-foreground'}`}
                      onClick={() => {
                        if (item.href) { router.push(item.href); onClose(); }
                        else if (item.action) { item.action(); onClose(); }
                      }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-forest-100' : 'bg-muted'}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        {item.sublabel && <p className="text-xs text-muted-foreground truncate">{item.sublabel}</p>}
                      </div>
                      {item.badge && (
                        <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full flex-shrink-0">{item.badge}</span>
                      )}
                      {isSelected && <ArrowRight className="w-4 h-4 text-forest-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><kbd className="bg-muted border border-border rounded px-1">↑↓</kbd> Naviguer</span>
            <span className="flex items-center gap-1"><kbd className="bg-muted border border-border rounded px-1">↵</kbd> Ouvrir</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Command className="w-3 h-3" /><span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hook pour ouvrir la palette avec Cmd+K ───────────────────────────────────

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}
