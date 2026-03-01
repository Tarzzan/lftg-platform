'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, FormField, Input, Select, Textarea, ModalFooter, BtnPrimary, BtnSecondary } from '../ui/Modal';
import { stockApi } from '@/lib/api';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: any; // Required: the stock item for which to record a movement
}

export function StockMovementModal({ isOpen, onClose, article }: StockMovementModalProps) {
  const qc = useQueryClient();

  const [form, setForm] = useState({
    type: 'in',
    quantity: '',
    reason: '',
    reference: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm({ type: 'in', quantity: '', reason: '', reference: '', notes: '' });
    setErrors({});
  }, [isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
      e.quantity = 'Quantité invalide (doit être > 0)';
    }
    if (form.type === 'out' && article && Number(form.quantity) > article.quantity) {
      e.quantity = `Stock insuffisant (disponible : ${article.quantity} ${article.unit})`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: any) => stockApi.createMovement(article.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-articles'] });
      qc.invalidateQueries({ queryKey: ['stock-alerts'] });
      qc.invalidateQueries({ queryKey: ['stock-movements', article?.id] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ ...form, quantity: Number(form.quantity) });
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!article) return null;

  const newQty = form.quantity
    ? form.type === 'in'
      ? article.quantity + Number(form.quantity)
      : article.quantity - Number(form.quantity)
    : article.quantity;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Mouvement de stock — ${article.name}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current stock info */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 border border-border">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Stock actuel</p>
            <p className="text-lg font-bold text-foreground">{article.quantity} <span className="text-sm font-normal">{article.unit}</span></p>
          </div>
          {form.quantity && (
            <>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="flex-1 text-right">
                <p className="text-xs text-muted-foreground">Après mouvement</p>
                <p className={`text-lg font-bold ${newQty < 0 ? 'text-red-600' : newQty <= article.lowStockThreshold ? 'text-gold-600' : 'text-forest-600'}`}>
                  {newQty} <span className="text-sm font-normal">{article.unit}</span>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Type de mouvement">
            <Select value={form.type} onChange={set('type')}>
              <option value="in">Entrée (+)</option>
              <option value="out">Sortie (−)</option>
              <option value="adjustment">Ajustement</option>
            </Select>
          </FormField>
          <FormField label={`Quantité (${article.unit}) *`} error={errors.quantity}>
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

        <FormField label="Motif">
          <Input value={form.reason} onChange={set('reason')} placeholder="Ex: Livraison, Consommation journalière..." />
        </FormField>

        <FormField label="Référence (bon de livraison, etc.)">
          <Input value={form.reference} onChange={set('reference')} placeholder="Ex: BL-2026-0042" />
        </FormField>

        <FormField label="Notes">
          <Textarea value={form.notes} onChange={set('notes')} placeholder="Informations complémentaires..." rows={2} />
        </FormField>

        {mutation.isError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            Une erreur est survenue. Veuillez réessayer.
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
