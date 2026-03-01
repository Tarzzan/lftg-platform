'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, AlertTriangle, Plus, TrendingDown } from 'lucide-react';
import { stockApi } from '@/lib/api';

export default function StockArticlesPage() {
  const { data: items, isLoading } = useQuery({ queryKey: ['stock-items'], queryFn: stockApi.items });

  const lowStock = (items || []).filter((i: any) => i.isLowStock);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Articles en stock</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items?.length ?? 0} articles — {lowStock.length} en stock faible
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nouvel article
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              {lowStock.length} article{lowStock.length > 1 ? 's' : ''} en dessous du seuil d'alerte
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {lowStock.map((i: any) => i.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="lftg-card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Chargement...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Article</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Quantité</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Seuil d'alerte</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Unité</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((item: any) => (
                <tr key={item.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-laterite-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-laterite-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${item.isLowStock ? 'text-red-600' : 'text-foreground'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{item.lowStockThreshold}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.unit}</td>
                  <td className="py-3 px-4">
                    {item.isLowStock ? (
                      <span className="flex items-center gap-1 badge-rejected">
                        <TrendingDown className="w-3 h-3" /> Stock faible
                      </span>
                    ) : (
                      <span className="badge-approved">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && items?.length === 0 && (
          <p className="text-center py-12 text-muted-foreground text-sm">Aucun article en stock</p>
        )}
      </div>
    </div>
  );
}
