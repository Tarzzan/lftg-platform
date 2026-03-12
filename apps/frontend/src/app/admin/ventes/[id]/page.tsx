'use client';
import { toast } from 'sonner';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  REFUNDED: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  COMPLETED: 'Complétée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: sale, isLoading , isError } = useQuery({
    queryKey: ['sale', id],
    queryFn: () => api.get(`/ventes/${id}`).then(r => r.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => api.put(`/ventes/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sale', id] }),
  });

  const handleDownloadPdf = async () => {
    const response = await api.get(`/reports/sales`, {
      params: { dateFrom: sale.createdAt.split('T')[0], dateTo: sale.createdAt.split('T')[0] },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facture-${sale.reference}.pdf`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-600" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Vente introuvable</p>
        <button onClick={() => router.back()} className="mt-4 text-forest-600 hover:underline">← Retour</button>
      </div>
    );
  }

  const transitions = STATUS_TRANSITIONS[sale.status] || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800 transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-white font-mono">
              {sale.reference}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Créée le {new Date(sale.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[sale.status]}`}>
            {STATUS_LABELS[sale.status]}
          </span>
          <button
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:bg-muted/20 dark:hover:bg-gray-700 transition-colors"
          >PDF</button>
          {transitions.map(status => (
            <button
              key={status}
              onClick={() => updateStatusMutation.mutate(status)}
              disabled={updateStatusMutation.isPending}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === 'COMPLETED' ? 'bg-green-500 text-white hover:bg-green-600' :
                status === 'CONFIRMED' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                status === 'CANCELLED' ? 'bg-red-500 text-white hover:bg-red-600' :
                'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Facture */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-border dark:border-gray-700 p-8">
        {/* En-tête facture */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl"></span>
              <div>
                <p className="font-bold text-gray-900 dark:text-foreground dark:text-white text-lg">La Ferme Tropicale de Guyane</p>
                <p className="text-xs text-gray-500">LFTG Platform v4.0.0</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Guyane Française</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-white font-mono">{sale.reference}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {new Date(sale.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {sale.dueDate && (
              <p className="text-sm text-amber-600 mt-1">
                Échéance : {new Date(sale.dueDate).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </div>

        {/* Acheteur */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="p-4 bg-gray-50 dark:bg-muted/20 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Acheteur</p>
            <p className="font-semibold text-gray-900 dark:text-foreground dark:text-white">{sale.buyerName}</p>
            {sale.buyerEmail && <p className="text-sm text-gray-500">{sale.buyerEmail}</p>}
            {sale.buyerPhone && <p className="text-sm text-gray-500">{sale.buyerPhone}</p>}
            {sale.buyerAddress && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{sale.buyerAddress}</p>}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-muted/20 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Détails</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-900 dark:text-foreground dark:text-white">{sale.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paiement</span>
                <span className="font-medium text-gray-900 dark:text-foreground dark:text-white">{sale.paymentMethod || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Créé par</span>
                <span className="font-medium text-gray-900 dark:text-foreground dark:text-white">{sale.createdBy?.name || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lignes */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-border dark:border-gray-600">
              <th className="text-left py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              <th className="text-center py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qté</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prix HT</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">TVA</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {(sale.items || []).map((item: any, i: number) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-3 text-sm text-gray-900 dark:text-foreground dark:text-white">
                  {item.description}
                  {item.animal && (
                    <span className="text-xs text-gray-400 ml-2">({item.animal.identifier})</span>
                  )}
                </td>
                <td className="py-3 text-sm text-center text-gray-600 dark:text-gray-400 dark:text-gray-400">{item.quantity}</td>
                <td className="py-3 text-sm text-right text-gray-600 dark:text-gray-400 dark:text-gray-400">
                  {item.unitPrice.toFixed(2)} €
                </td>
                <td className="py-3 text-sm text-right text-gray-600 dark:text-gray-400 dark:text-gray-400">
                  {item.taxRate}%
                </td>
                <td className="py-3 text-sm text-right font-medium text-gray-900 dark:text-foreground dark:text-white">
                  {item.total.toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Sous-total HT</span>
              <span>{sale.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>TVA</span>
              <span>{sale.taxAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-foreground dark:text-white border-t border-gray-200 dark:border-border dark:border-gray-600 pt-2">
              <span>Total TTC</span>
              <span>{sale.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {sale.notes && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Notes</p>
            <p className="text-sm text-amber-600 dark:text-amber-300">{sale.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
