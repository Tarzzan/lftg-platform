'use client';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, FormField, Input, Select, Textarea, ModalFooter, BtnPrimary, BtnSecondary } from '../ui/Modal';
import { formationApi } from '@/lib/api';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: any;
}

const LEVELS = ['débutant', 'intermédiaire', 'avancé'];
const CATEGORIES = ['Soins animaliers', 'Sécurité', 'Gestion de stock', 'Réglementation', 'Premiers secours', 'Autre'];

export function CourseModal({ isOpen, onClose, course }: CourseModalProps) {
  const qc = useQueryClient();
  const isEdit = !!course;
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Soins animaliers',
    level: 'débutant',
    duration: '',
    isPublished: 'false',
    isPublic: 'false',
    thumbnailUrl: '',
    coverImage: '',
    tags: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title ?? '',
        description: course.description ?? '',
        category: course.category ?? 'Soins animaliers',
        level: course.level ?? 'débutant',
        duration: String(course.duration ?? ''),
        isPublished: String(course.isPublished ?? false),
        isPublic: String(course.isPublic ?? false),
        thumbnailUrl: course.thumbnailUrl ?? course.imageUrl ?? '',
        coverImage: course.coverImage ?? '',
        tags: (course.tags ?? []).join(', '),
      });
    } else {
      setForm({
        title: '', description: '', category: 'Soins animaliers', level: 'débutant',
        duration: '', isPublished: 'false', isPublic: 'false', thumbnailUrl: '', coverImage: '', tags: '',
      });
    }
    setErrors({});
  }, [course, isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Le titre est requis';
    if (form.duration && (isNaN(Number(form.duration)) || Number(form.duration) < 0)) {
      e.duration = 'Durée invalide (en minutes)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? formationApi.updateCourse(course.id, data) : formationApi.createCourse(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      ...form,
      duration: form.duration ? Number(form.duration) : undefined,
      isPublished: form.isPublished === 'true',
      isPublic: form.isPublic === 'true',
      thumbnailUrl: form.thumbnailUrl || undefined,
      coverImage: form.coverImage || undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Modifier la formation' : 'Nouvelle formation'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Titre *" error={errors.title}>
          <Input value={form.title} onChange={set('title')} placeholder="Ex: Soins aux perroquets néotropicaux" autoFocus />
        </FormField>
        <FormField label="Description">
          <Textarea
            value={form.description}
            onChange={set('description')}
            placeholder="Décrivez les objectifs et le contenu de cette formation..."
            rows={3}
          />
        </FormField>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Catégorie">
            <Select value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Niveau">
            <Select value={form.level} onChange={set('level')}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </Select>
          </FormField>
          <FormField label="Durée (minutes)" error={errors.duration}>
            <Input type="number" min="0" value={form.duration} onChange={set('duration')} placeholder="Ex: 120" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Statut de publication">
            <Select value={form.isPublished} onChange={set('isPublished')}>
              <option value="false">Brouillon</option>
              <option value="true">Publié</option>
            </Select>
          </FormField>
          <FormField label="Visible sur le site public">
            <Select value={form.isPublic} onChange={set('isPublic')}>
              <option value="false">Non — Privé (membres uniquement)</option>
              <option value="true">Oui — Affiché sur la page d'accueil</option>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="URL de la miniature (liste admin)">
            <Input value={form.thumbnailUrl} onChange={set('thumbnailUrl')} placeholder="https://..." />
          </FormField>
          <FormField label="Image de fond (page publique)">
            <Input value={form.coverImage} onChange={set('coverImage')} placeholder="https://..." />
          </FormField>
        </div>
        {/* Aperçu de l'image de fond */}
        {form.coverImage && (
          <div className="rounded-xl overflow-hidden border border-forest-200">
            <div className="bg-forest-50 px-3 py-1.5 text-xs font-medium text-forest-600 border-b border-forest-200">
              Aperçu de l'image de fond
            </div>
            <div className="relative h-28 bg-forest-100">
              <img
                src={form.coverImage}
                alt="Aperçu"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-3">
                <span className="text-white text-xs font-semibold truncate">{form.title || 'Titre de la formation'}</span>
              </div>
            </div>
          </div>
        )}
        {/* Badge isPublic */}
        {form.isPublic === 'true' && (
          <div className="flex items-center gap-2 bg-forest-50 border border-forest-200 rounded-xl px-4 py-3 text-forest-700 text-sm">
            <span>🌐</span>
            <span>Cette formation sera visible sur la page d'accueil publique du site.</span>
          </div>
        )}
        <FormField label="Tags (séparés par des virgules)">
          <Input value={form.tags} onChange={set('tags')} placeholder="Ex: perroquets, soins, débutant" />
        </FormField>
        {mutation.isError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            Une erreur est survenue. Veuillez réessayer.
          </p>
        )}
        <ModalFooter>
          <BtnSecondary type="button" onClick={onClose}>Annuler</BtnSecondary>
          <BtnPrimary type="submit" loading={mutation.isPending}>
            {isEdit ? 'Enregistrer' : 'Créer la formation'}
          </BtnPrimary>
        </ModalFooter>
      </form>
    </Modal>
  );
}
