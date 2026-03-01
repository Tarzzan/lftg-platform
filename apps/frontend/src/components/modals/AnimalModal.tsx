'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, FormField, Input, Select, Textarea, ModalFooter, BtnPrimary, BtnSecondary } from '../ui/Modal';
import { animauxApi } from '@/lib/api';

interface AnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal?: any;
}

export function AnimalModal({ isOpen, onClose, animal }: AnimalModalProps) {
  const qc = useQueryClient();
  const isEdit = !!animal;

  const { data: species = [] } = useQuery({ queryKey: ['species'], queryFn: animauxApi.species });
  const { data: enclosures = [] } = useQuery({ queryKey: ['enclosures'], queryFn: animauxApi.enclosures });

  const [form, setForm] = useState({
    name: '',
    speciesId: '',
    enclosureId: '',
    sex: '',
    birthDate: '',
    origin: '',
    status: 'alive',
    notes: '',
    ringNumber: '',
    microchipNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (animal) {
      setForm({
        name: animal.name ?? '',
        speciesId: animal.speciesId ?? '',
        enclosureId: animal.enclosureId ?? '',
        sex: animal.sex ?? '',
        birthDate: animal.birthDate ? animal.birthDate.slice(0, 10) : '',
        origin: animal.origin ?? '',
        status: animal.status ?? 'alive',
        notes: animal.notes ?? '',
        ringNumber: animal.ringNumber ?? '',
        microchipNumber: animal.microchipNumber ?? '',
      });
    } else {
      setForm({ name: '', speciesId: '', enclosureId: '', sex: '', birthDate: '', origin: '', status: 'alive', notes: '', ringNumber: '', microchipNumber: '' });
    }
    setErrors({});
  }, [animal, isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom est requis';
    if (!form.speciesId) e.speciesId = 'L\'espèce est requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? animauxApi.updateAnimal(animal.id, data) : animauxApi.createAnimal(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['animals'] });
      qc.invalidateQueries({ queryKey: ['animal-stats'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      ...form,
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : undefined,
    });
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Modifier l\'animal' : 'Nouvel animal'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nom *" error={errors.name}>
            <Input value={form.name} onChange={set('name')} placeholder="Ex: Ara Bleu #12" autoFocus />
          </FormField>
          <FormField label="Espèce *" error={errors.speciesId}>
            <Select value={form.speciesId} onChange={set('speciesId')}>
              <option value="">— Sélectionner une espèce —</option>
              {(species as any[]).map((s: any) => (
                <option key={s.id} value={s.id}>{s.commonName || s.name}</option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Sexe">
            <Select value={form.sex} onChange={set('sex')}>
              <option value="">Inconnu</option>
              <option value="male">Mâle</option>
              <option value="female">Femelle</option>
            </Select>
          </FormField>
          <FormField label="Date de naissance">
            <Input type="date" value={form.birthDate} onChange={set('birthDate')} />
          </FormField>
          <FormField label="Statut">
            <Select value={form.status} onChange={set('status')}>
              <option value="alive">Vivant</option>
              <option value="deceased">Décédé</option>
              <option value="transferred">Transféré</option>
              <option value="released">Relâché</option>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Enclos">
            <Select value={form.enclosureId} onChange={set('enclosureId')}>
              <option value="">— Sans enclos —</option>
              {(enclosures as any[]).map((enc: any) => (
                <option key={enc.id} value={enc.id}>{enc.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Origine">
            <Input value={form.origin} onChange={set('origin')} placeholder="Ex: Élevage, Sauvage, Don..." />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Numéro de bague">
            <Input value={form.ringNumber} onChange={set('ringNumber')} placeholder="Ex: FR-2024-001" />
          </FormField>
          <FormField label="Numéro de puce">
            <Input value={form.microchipNumber} onChange={set('microchipNumber')} placeholder="Ex: 250268500000001" />
          </FormField>
        </div>

        <FormField label="Notes">
          <Textarea value={form.notes} onChange={set('notes')} placeholder="Observations, comportement, particularités..." rows={3} />
        </FormField>

        {mutation.isError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            Une erreur est survenue. Veuillez réessayer.
          </p>
        )}

        <ModalFooter>
          <BtnSecondary type="button" onClick={onClose}>Annuler</BtnSecondary>
          <BtnPrimary type="submit" loading={mutation.isPending}>
            {isEdit ? 'Enregistrer' : 'Créer l\'animal'}
          </BtnPrimary>
        </ModalFooter>
      </form>
    </Modal>
  );
}
