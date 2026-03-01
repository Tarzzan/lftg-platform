'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Users, Calendar, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { formationApi } from '@/lib/api';
import { Modal, FormField, Input, Select, ModalFooter, BtnPrimary, BtnSecondary } from '@/components/ui/Modal';

function CohortModal({ isOpen, onClose, cohort, courses }: {
  isOpen: boolean; onClose: () => void; cohort?: any; courses: any[];
}) {
  const qc = useQueryClient();
  const isEdit = !!cohort;
  const [form, setForm] = useState({ name: '', courseId: '', startDate: '', endDate: '', maxParticipants: '20', status: 'upcoming' });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? formationApi.createCohort(data) : formationApi.createCohort(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cohorts'] }); onClose(); },
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      maxParticipants: Number(form.maxParticipants),
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Modifier la cohorte' : 'Nouvelle cohorte'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nom de la cohorte *">
          <Input value={form.name} onChange={set('name')} placeholder="Ex: Cohorte Printemps 2026" autoFocus />
        </FormField>
        <FormField label="Formation *">
          <Select value={form.courseId} onChange={set('courseId')}>
            <option value="">— Sélectionner une formation —</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date de début">
            <Input type="date" value={form.startDate} onChange={set('startDate')} />
          </FormField>
          <FormField label="Date de fin">
            <Input type="date" value={form.endDate} onChange={set('endDate')} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Participants max">
            <Input type="number" min="1" value={form.maxParticipants} onChange={set('maxParticipants')} />
          </FormField>
          <FormField label="Statut">
            <Select value={form.status} onChange={set('status')}>
              <option value="upcoming">À venir</option>
              <option value="active">En cours</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </Select>
          </FormField>
        </div>
        <ModalFooter>
          <BtnSecondary type="button" onClick={onClose}>Annuler</BtnSecondary>
          <BtnPrimary type="submit" loading={mutation.isPending}>
            {isEdit ? 'Enregistrer' : 'Créer la cohorte'}
          </BtnPrimary>
        </ModalFooter>
      </form>
    </Modal>
  );
}

const STATUS_CLASSES: Record<string, string> = {
  upcoming: 'bg-maroni-100 text-maroni-700',
  active: 'bg-forest-100 text-forest-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  upcoming: 'À venir', active: 'En cours', completed: 'Terminé', cancelled: 'Annulé',
};

export default function CohortesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; cohort?: any }>({ open: false });

  const { data: cohorts = [], isLoading } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => formationApi.cohorts(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => formationApi.courses(),
  });

  const filtered = useMemo(() => {
    let list = cohorts as any[];
    if (search) list = list.filter((c: any) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.course?.title ?? '').toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [cohorts, search]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cohortes de formation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {(cohorts as any[]).length} cohorte{(cohorts as any[]).length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle cohorte
        </button>
      </div>

      {/* Search */}
      <div className="lftg-card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une cohorte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="lftg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cohorte</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Formation</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dates</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Participants</th>
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
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Aucune cohorte trouvée
                </td>
              </tr>
            ) : filtered.map((cohort: any) => (
              <tr key={cohort.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{cohort.name}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{cohort.course?.title ?? '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {cohort.startDate ? new Date(cohort.startDate).toLocaleDateString('fr-FR') : '—'}
                    {cohort.endDate && ` → ${new Date(cohort.endDate).toLocaleDateString('fr-FR')}`}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-medium text-foreground">
                    {cohort._count?.enrollments ?? 0}
                    {cohort.maxParticipants && ` / ${cohort.maxParticipants}`}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CLASSES[cohort.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {STATUS_LABELS[cohort.status] ?? cohort.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setModal({ open: true, cohort })}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CohortModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false })}
        cohort={modal.cohort}
        courses={courses as any[]}
      />
    </div>
  );
}
