'use client';
import { toast } from 'sonner';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Package, AlertTriangle, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { stockApi, exportApi } from '@/lib/api';
import { StockArticleModal } from '@/components/modals/StockArticleModal';
import { StockMovementModal } from '@/components/modals/StockMovementModal';

const CATEGORIES = ['Tous', 'Alimentation', 'Médicaments', 'Équipement', 'Nettoyage', 'Incubation', 'Autre'];

export default function StockArticlesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const [alertOnly, setAlertOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'category'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [articleModal, setArticleModal] = useState<{ open: boolean; article?: any }>({ open: false });
  const [movementModal, setMovementModal] = useState<{ open: boolean; article?: any }>({ open: false });

  const { data: items = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['stock-articles'],
    queryFn: stockApi.items,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => stockApi.deleteArticle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock-articles'] }),
  });

  const filtered = useMemo(() => {
    let list = items as any[];
    if (search) list = list.filter((i: any) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.category ?? '').toLowerCase().includes(search.toLowerCase())
    );
    if (category !== 'Tous') list = list.filter((i: any) => i.category === category);
    if (alertOnly) list = list.filter((i: any) => i.quantity <= i.lowStockThreshold);
    list = [...list].sort((a, b) => {
      const va = sortBy === 'quantity' ? a[sortBy] : String(a[sortBy] ?? '').toLowerCase();
      const vb = sortBy === 'quantity' ? b[sortBy] : String(b[sortBy] ?? '').toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [items, search, category, alertOnly, sortBy, sortDir]);

  const alertCount = (items as any[]).filter((i: any) => i.quantity <= i.lowStockThreshold).length;

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventaire de stock</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {(items as any[]).length} article{(items as any[]).length !== 1 ? 's' : ''} · {alertCount} alerte{alertCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={exportApi.stockCsv()}
            download
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </a>
          <button
            onClick={() => setArticleModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvel article
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="lftg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  category === cat ? 'bg-forest-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAlertOnly(!alertOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
              alertOnly ? 'bg-red-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Alertes seulement
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="lftg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                    Article <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort('category')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                    Catégorie <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button onClick={() => toggleSort('quantity')} className="flex items-center gap-1 ml-auto text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                    Quantité <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Seuil</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Aucun article trouvé
                  </td>
                </tr>
              ) : filtered.map((item: any) => {
                const isAlert = item.quantity <= item.lowStockThreshold;
                return (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        {item.location && <p className="text-xs text-muted-foreground">{item.location}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">{item.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${isAlert ? 'text-red-600' : 'text-foreground'}`}>
                        {item.quantity}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {item.lowStockThreshold} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isAlert ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3" /> Alerte
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-forest-100 text-forest-700">
                          ✓ OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setMovementModal({ open: true, article: item })}
                          className="px-2.5 py-1.5 text-xs font-medium bg-maroni-50 text-maroni-700 rounded-lg hover:bg-maroni-100 transition-colors"
                        >
                          Mouvement
                        </button>
                        <button
                          onClick={() => setArticleModal({ open: true, article: item })}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Supprimer cet article ?')) deleteMutation.mutate(item.id); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StockArticleModal
        isOpen={articleModal.open}
        onClose={() => setArticleModal({ open: false })}
        article={articleModal.article}
      />
      <StockMovementModal
        isOpen={movementModal.open}
        onClose={() => setMovementModal({ open: false })}
        article={movementModal.article}
      />
    </div>
  );
}
