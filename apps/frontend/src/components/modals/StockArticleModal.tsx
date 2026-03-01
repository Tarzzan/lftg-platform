'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, FormField, Input, Select, Textarea, ModalFooter, BtnPrimary, BtnSecondary } from '../ui/Modal';
import { stockApi } from '@/lib/api';

interface StockArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: any; // null = create, object = edit
}

const CATEGORIES = ['Alimentation', 'Médicaments', 'Équipement', 'Nettoyage', 'Incubation', 'Autre'];
const UNITS = ['kg', 'g', 'L', 'mL', 'pièce(s)', 'boîte(s)', 'sachet(s)', 'flacon(s)'];

export function StockArticleModal({ isOpen, onClose, article }: StockArticleModalProps) {
  const qc = useQueryClient();
  const isEdit = !!article;

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Alimentation',
    unit: 'kg',
    quantity: '0',
    lowStockThreshold: '5',
    location: '',
    supplier: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (article) {
      setForm({
        name: article.name ?? '',
        description: article.description ?? '',
        category: article.category ?? 'Alimentation',
        unit: article.unit ?? 'kg',
        quantity: String(article.quantity ?? 0),
        lowStockThreshold: String(article.lowStockThreshold ?? 5),
        location: article.location ?? '',
        supplier: article.supplier ?? '',
      });
    } else {
      setForm({ name: '', description: '', category: 'Alimentation', unit: 'kg', quantity: '0', lowStockThreshold: '5', location: '', supplier: '' });
    }
    setErrors({});
  }, [article, isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom est requis';
    if (isNaN(Number(form.quantity)) || Number(form.quantity) < 0) e.quantity = 'Quantité invalide';
    if (isNaN(Number(form.lowStockThreshold)) || Number(form.lowStockThreshold) < 0) e.lowStockThreshold = 'Seuil invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? stockApi.updateArticle(article.id, data) : stockApi.createArticle(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-articles'] });
      qc.invalidateQueries({ queryKey: ['stock-alerts'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      ...form,
      quantity: Number(form.quantity),
      lowStockThreshold: Number(form.lowStockThreshold),
    });
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Modifier l\'article' : 'Nouvel article de stock'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nom *" error={errors.name}>
            <Input value={form.name} onChange={set('name')} placeholder="Ex: Granulés perroquets" autoFocus />
          </FormField>
          <FormField label="Catégorie">
            <Select value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </FormField>
        </div>

        <FormField label="Description">
          <Textarea value={form.description} onChange={set('description')} placeholder="Description optionnelle..." />
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Quantité *" error={errors.quantity}>
            <Input type="number" min="0" step="0.01" value={form.quantity} onChange={set('quantity')} />
          </FormField>
          <FormField label="Unité">
            <Select value={form.unit} onChange={set('unit')}>
              {UNITS.map((u) => <option key={u}>{u}</option>)}
            </Select>
          </FormField>
          <FormField label="Seuil alerte *" error={errors.lowStockThreshold}>
            <Input type="number" min="0" step="0.01" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Emplacement">
            <Input value={form.location} onChange={set('location')} placeholder="Ex: Entrepôt A, Étagère 3" />
          </FormField>
          <FormField label="Fournisseur">
            <Input value={form.supplier} onChange={set('supplier')} placeholder="Ex: AgroTrop Guyane" />
          </FormField>
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            Une erreur est survenue. Veuillez réessayer.
          </p>
        )}

        <ModalFooter>
          <BtnSecondary type="button" onClick={onClose}>Annuler</BtnSecondary>
          <BtnPrimary type="submit" loading={mutation.isPending}>
            {isEdit ? 'Enregistrer' : 'Créer l\'article'}
          </BtnPrimary>
        </ModalFooter>
      </form>
    </Modal>
  );
}
