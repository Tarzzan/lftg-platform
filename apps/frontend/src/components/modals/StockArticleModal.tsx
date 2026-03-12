'use client';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, FormField, Input, Select, Textarea, ModalFooter, BtnPrimary, BtnSecondary } from '../ui/Modal';
import { ImageUpload } from '../ui/ImageUpload';
import { stockApi } from '@/lib/api';
import { toast } from 'sonner';

interface StockArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: any; // null = create, object = edit
}

// Valeurs en majuscules pour correspondre exactement à la base de données
export const CATEGORIES: { value: string; label: string; color: string }[] = [
  { value: 'ALIMENTATION',  label: 'Alimentation',  color: 'bg-green-100 text-green-700' },
  { value: 'VETERINAIRE',   label: 'Vétérinaire',   color: 'bg-blue-100 text-blue-700' },
  { value: 'ENTRETIEN',     label: 'Entretien',     color: 'bg-yellow-100 text-yellow-700' },
  { value: 'MATERIEL',      label: 'Matériel',      color: 'bg-purple-100 text-purple-700' },
  { value: 'INCUBATION',    label: 'Incubation',    color: 'bg-orange-100 text-orange-700' },
  { value: 'AUTRE',         label: 'Autre',         color: 'bg-gray-100 text-gray-600' },
];

export function getCategoryMeta(value: string) {
  return CATEGORIES.find((c) => c.value === value?.toUpperCase()) ?? {
    value: value ?? '',
    label: value ?? '—',
    color: 'bg-gray-100 text-gray-500',
  };
}

const UNITS = ['kg', 'g', 'L', 'mL', 'pièce(s)', 'boîte(s)', 'sachet(s)', 'flacon(s)', 'sac'];

export function StockArticleModal({ isOpen, onClose, article }: StockArticleModalProps) {
  const qc = useQueryClient();
  const isEdit = !!article;
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'ALIMENTATION',
    unit: 'kg',
    quantity: '0',
    lowStockThreshold: '5',
    location: '',
    supplier: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (article) {
      setForm({
        name: article.name ?? '',
        description: article.description ?? '',
        category: (article.category ?? 'ALIMENTATION').toUpperCase(),
        unit: article.unit ?? 'kg',
        quantity: String(article.quantity ?? 0),
        lowStockThreshold: String(article.lowStockThreshold ?? 5),
        location: article.location ?? '',
        supplier: article.supplier ?? '',
        imageUrl: article.imageUrl ?? '',
      });
    } else {
      setForm({
        name: '',
        description: '',
        category: 'ALIMENTATION',
        unit: 'kg',
        quantity: '0',
        lowStockThreshold: '5',
        location: '',
        supplier: '',
        imageUrl: '',
      });
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
      toast.success(isEdit ? 'Article modifié avec succès' : 'Article créé avec succès');
      onClose();
    },
    onError: () => {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Modifier l'article" : 'Nouvel article de stock'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image upload — uniquement en mode édition car on a besoin de l'ID */}
        {isEdit && article?.id && (
          <ImageUpload
            currentImageUrl={form.imageUrl || null}
            uploadUrl={`/plugins/stock/items/${article.id}/image`}
            onSuccess={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            label="Photo de l'article"
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nom *" error={errors.name}>
            <Input value={form.name} onChange={set('name')} placeholder="Ex: Granulés perroquets" autoFocus />
          </FormField>
          <FormField label="Catégorie">
            <Select value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
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
            {isEdit ? 'Enregistrer' : "Créer l'article"}
          </BtnPrimary>
        </ModalFooter>
      </form>
    </Modal>
  );
}
