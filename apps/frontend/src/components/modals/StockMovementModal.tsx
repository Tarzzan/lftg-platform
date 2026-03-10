'use client';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal, FormField, Input, Select, Textarea, ModalFooter, BtnPrimary, BtnSecondary } from '../ui/Modal';
import { stockApi } from '@/lib/api';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: any;
}

export function StockMovementModal({ isOpen, onClose, article }: StockMovementModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    type: 'IN',
    quantity: '',
    notes: '',
    reference: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm({ type: 'IN', quantity: '', notes: '', reference: '' });
    setErrors({});
  }, [isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
      e.quantity = 'Quantité invalide (doit être > 0)';
    }
    if (form.type === 'OUT' && article && Number(form.quantity) > article.quantity) {
      e.quantity = `Stock insuffisant (disponible : ${article.quantity} ${article.unit || ''})`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: typeof form) => {
      // Les sorties sont envoyées avec quantité négative pour que le service calcule correctement
      let qty = Number(data.quantity);
      if (data.type === 'OUT') qty = -Math.abs(qty);

      const notes = [data.notes, data.reference].filter(Boolean).join(' — ') || undefined;

      return stockApi.createMovement(article.id, {
        type: data.type,
        quantity: qty,
        notes,
      });
    },
    onSuccess: () => {
      toast.success('Mouvement enregistré avec succès');
      qc.invalidateQueries({ queryKey: ['stock-articles'] });
      qc.invalidateQueries({ queryKey: ['stock-alerts'] });
      qc.invalidateQueries({ queryKey: ['stock-movements'] });
      qc.invalidateQueries({ queryKey: ['stock-items-list'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Erreur lors de l\'enregistrement';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate(form);
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!article) return null;

  const qty = Number(form.quantity) || 0;
  const newQty = form.quantity
    ? form.type === 'IN'
      ? article.quantity + qty
      : form.type === 'OUT'
        ? article.quantity - qty
        : article.quantity + qty  // ADJUSTMENT: positif par défaut
    : article.quantity;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Mouvement de stock — ${article.name}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info stock actuel → après mouvement */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 border border-border">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Stock actuel</p>
            <p className="text-lg font-bold text-foreground">
              {article.quantity} <span className="text-sm font-normal text-muted-foreground">{article.unit}</span>
            </p>
          </div>
          {form.quantity && (
            <>
              <div className="text-xl text-muted-foreground">→</div>
              <div className="flex-1 text-right">
                <p className="text-xs text-muted-foreground">Après mouvement</p>
                <p className={`text-lg font-bold ${
                  newQty < 0
                    ? 'text-red-600'
                    : newQty <= (article.lowStockThreshold ?? 0)
                      ? 'text-gold-600'
                      : 'text-forest-600'
                }`}>
                  {newQty} <span className="text-sm font-normal">{article.unit}</span>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Type de mouvement">
            <Select value={form.type} onChange={set('type')}>
              <option value="IN">Entrée (+)</option>
              <option value="OUT">Sortie (−)</option>
              <option value="ADJUSTMENT">Ajustement</option>
              <option value="TRANSFER">Transfert</option>
            </Select>
          </FormField>
          <FormField label={`Quantité (${article.unit || 'unité'}) *`} error={errors.quantity}>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={form.quantity}
              onChange={set('quantity')}
              placeholder="0"
              autoFocus
            />
          </FormField>
        </div>

        <FormField label="Motif / Notes">
          <Input
            value={form.notes}
            onChange={set('notes')}
            placeholder="Ex: Livraison fournisseur, consommation journalière..."
          />
        </FormField>

        <FormField label="Référence (bon de livraison, etc.)">
          <Input
            value={form.reference}
            onChange={set('reference')}
            placeholder="Ex: BL-2026-0042"
          />
        </FormField>

        {mutation.isError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            {(mutation.error as any)?.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'}
          </p>
        )}

        <ModalFooter>
          <BtnSecondary type="button" onClick={onClose}>Annuler</BtnSecondary>
          <BtnPrimary type="submit" loading={mutation.isPending}>
            Enregistrer le mouvement
          </BtnPrimary>
        </ModalFooter>
      </form>
    </Modal>
  );
}
