'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, FormField, Input, Select, Textarea, ModalFooter, BtnPrimary, BtnSecondary } from '../ui/Modal';
import { animauxApi } from '@/lib/api';

interface BroodModalProps {
  isOpen: boolean;
  onClose: () => void;
  brood?: any;
}

export function BroodModal({ isOpen, onClose, brood }: BroodModalProps) {
  const qc = useQueryClient();
  const isEdit = !!brood;

  const { data: animals = [] } = useQuery({ queryKey: ['animals'], queryFn: animauxApi.animals });

  const [form, setForm] = useState({
    name: '',
    motherId: '',
    fatherId: '',
    startDate: '',
    expectedHatchDate: '',
    eggCount: '0',
    status: 'incubating',
    incubatorId: '',
    temperature: '',
    humidity: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (brood) {
      setForm({
        name: brood.name ?? '',
        motherId: brood.motherId ?? '',
        fatherId: brood.fatherId ?? '',
        startDate: brood.startDate ? brood.startDate.slice(0, 10) : '',
        expectedHatchDate: brood.expectedHatchDate ? brood.expectedHatchDate.slice(0, 10) : '',
        eggCount: String(brood.eggCount ?? 0),
        status: brood.status ?? 'incubating',
        incubatorId: brood.incubatorId ?? '',
        temperature: String(brood.temperature ?? ''),
        humidity: String(brood.humidity ?? ''),
        notes: brood.notes ?? '',
      });
    } else {
      setForm({ name: '', motherId: '', fatherId: '', startDate: new Date().toISOString().slice(0, 10), expectedHatchDate: '', eggCount: '0', status: 'incubating', incubatorId: '', temperature: '', humidity: '', notes: '' });
    }
    setErrors({});
  }, [brood, isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom est requis';
    if (!form.startDate) e.startDate = 'La date de début est requise';
    if (isNaN(Number(form.eggCount)) || Number(form.eggCount) < 0) e.eggCount = 'Nombre d\'œufs invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? animauxApi.updateBrood(brood.id, data) : animauxApi.createBrood(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['broods'] });
      qc.invalidateQueries({ queryKey: ['animal-stats'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      ...form,
      eggCount: Number(form.eggCount),
      temperature: form.temperature ? Number(form.temperature) : undefined,
      humidity: form.humidity ? Number(form.humidity) : undefined,
      startDate: new Date(form.startDate).toISOString(),
      expectedHatchDate: form.expectedHatchDate ? new Date(form.expectedHatchDate).toISOString() : undefined,
    });
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const femaleAnimals = (animals as any[]).filter((a: any) => a.sex === 'female' || !a.sex);
  const maleAnimals = (animals as any[]).filter((a: any) => a.sex === 'male' || !a.sex);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Modifier la couvée' : 'Nouvelle couvée'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nom de la couvée *" error={errors.name}>
            <Input value={form.name} onChange={set('name')} placeholder="Ex: Couvée Ara Bleu 2026-01" autoFocus />
          </FormField>
          <FormField label="Statut">
            <Select value={form.status} onChange={set('status')}>
              <option value="incubating">En incubation</option>
              <option value="hatched">Éclos</option>
              <option value="failed">Échec</option>
              <option value="cancelled">Annulé</option>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Mère">
            <Select value={form.motherId} onChange={set('motherId')}>
              <option value="">— Sélectionner —</option>
              {femaleAnimals.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name} ({a.species?.commonName ?? a.species?.name ?? ''})</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Père">
            <Select value={form.fatherId} onChange={set('fatherId')}>
              <option value="">— Sélectionner —</option>
              {maleAnimals.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name} ({a.species?.commonName ?? a.species?.name ?? ''})</option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Date de début *" error={errors.startDate}>
            <Input type="date" value={form.startDate} onChange={set('startDate')} />
          </FormField>
          <FormField label="Date d'éclosion prévue">
            <Input type="date" value={form.expectedHatchDate} onChange={set('expectedHatchDate')} />
          </FormField>
          <FormField label="Nombre d'œufs *" error={errors.eggCount}>
            <Input type="number" min="0" value={form.eggCount} onChange={set('eggCount')} />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="ID Incubateur">
            <Input value={form.incubatorId} onChange={set('incubatorId')} placeholder="Ex: INC-01" />
          </FormField>
          <FormField label="Température (°C)">
            <Input type="number" step="0.1" value={form.temperature} onChange={set('temperature')} placeholder="37.5" />
          </FormField>
          <FormField label="Humidité (%)">
            <Input type="number" min="0" max="100" value={form.humidity} onChange={set('humidity')} placeholder="55" />
          </FormField>
        </div>

        <FormField label="Notes">
          <Textarea value={form.notes} onChange={set('notes')} placeholder="Observations, particularités..." />
        </FormField>

        {mutation.isError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            Une erreur est survenue. Veuillez réessayer.
          </p>
        )}

        <ModalFooter>
          <BtnSecondary type="button" onClick={onClose}>Annuler</BtnSecondary>
          <BtnPrimary type="submit" loading={mutation.isPending}>
            {isEdit ? 'Enregistrer' : 'Créer la couvée'}
          </BtnPrimary>
        </ModalFooter>
      </form>
    </Modal>
  );
}
