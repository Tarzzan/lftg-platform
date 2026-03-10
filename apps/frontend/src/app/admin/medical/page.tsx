'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Stethoscope, Calendar, AlertCircle, CheckCircle, Clock,
  Search, Filter, Plus, Bird, Syringe, Pill, TrendingUp, X,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface MedicalVisit {
  id: string;
  type: string;
  visitDate: string;
  vetName: string;
  diagnosis?: string;
  nextVisitDate?: string;
  animal: { id: string; name: string; species: { name: string } };
}
interface MedicalDashboard {
  totalVisits: number;
  upcomingVisits: number;
  activeAnimals: number;
  recentVisits: MedicalVisit[];
}
interface Animal {
  id: string;
  name: string;
  species: { name: string };
}

const visitTypeLabels: Record<string, string> = {
  ROUTINE: 'Routine',
  EMERGENCY: 'Urgence',
  SURGERY: 'Chirurgie',
  VACCINATION: 'Vaccination',
  CHECKUP: 'Bilan',
  FOLLOWUP: 'Suivi',
};
const visitTypeColors: Record<string, string> = {
  ROUTINE: 'bg-green-100 text-green-700',
  EMERGENCY: 'bg-red-100 text-red-700',
  SURGERY: 'bg-purple-100 text-purple-700',
  VACCINATION: 'bg-blue-100 text-blue-700',
  CHECKUP: 'bg-teal-100 text-teal-700',
  FOLLOWUP: 'bg-amber-100 text-amber-700',
};

export default function MedicalPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    animalId: '',
    type: 'ROUTINE',
    visitDate: new Date().toISOString().split('T')[0],
    vetName: '',
    diagnosis: '',
    notes: '',
    weight: '',
    temperature: '',
    nextVisitDate: '',
  });
  const [formError, setFormError] = useState('');

  const queryClient = useQueryClient();

  const { data: dashboard } = useQuery<MedicalDashboard>({
    queryKey: ['medical-dashboard'],
    queryFn: () => api.get('/medical/dashboard').then(r => r.data),
  });
  const { data: visits = [], isLoading } = useQuery<MedicalVisit[]>({
    queryKey: ['medical-visits', search, typeFilter, dateFrom, dateTo],
    queryFn: () => {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      return api.get(`/medical/visits?${params}`).then(r => r.data);
    },
  });
  const { data: animals = [] } = useQuery<Animal[]>({
    queryKey: ['animals-list'],
    queryFn: () => api.get('/plugins/animaux/animals').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => {
      const payload: Record<string, unknown> = {
        animalId: data.animalId,
        type: data.type,
        visitDate: data.visitDate,
        vetName: data.vetName,
      };
      if (data.diagnosis) payload.diagnosis = data.diagnosis;
      if (data.notes) payload.notes = data.notes;
      if (data.weight) payload.weight = parseFloat(data.weight);
      if (data.temperature) payload.temperature = parseFloat(data.temperature);
      if (data.nextVisitDate) payload.nextVisitDate = data.nextVisitDate;
      return api.post('/medical/visits', payload);
    },
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['medical-visits'] });
      queryClient.invalidateQueries({ queryKey: ['medical-dashboard'] });
      setShowModal(false);
      setForm({
        animalId: '',
        type: 'ROUTINE',
        visitDate: new Date().toISOString().split('T')[0],
        vetName: '',
        diagnosis: '',
        notes: '',
        weight: '',
        temperature: '',
        nextVisitDate: '',
      });
      setFormError('');
    },
    onError: (err: unknown) => {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg || 'Erreur lors de la création de la visite.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.animalId) { setFormError('Veuillez sélectionner un animal.'); return; }
    if (!form.vetName.trim()) { setFormError('Le nom du vétérinaire est requis.'); return; }
    createMutation.mutate(form);
  };

  const filtered = visits.filter(v =>
    !search ||
    v.animal.name.toLowerCase().includes(search.toLowerCase()) ||
    v.vetName.toLowerCase().includes(search.toLowerCase()) ||
    v.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Suivi Médical</h1>
          <p className="text-muted-foreground text-sm mt-1">Historique des visites vétérinaires et traitements</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle visite
        </button>
      </div>

      {/* Stats */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total visites', value: dashboard.totalVisits, icon: <Stethoscope className="w-5 h-5 text-forest-600" />, color: 'bg-forest-50' },
            { label: 'Visites à venir', value: dashboard.upcomingVisits, icon: <Calendar className="w-5 h-5 text-amber-600" />, color: 'bg-amber-50' },
            { label: 'Animaux actifs', value: dashboard.activeAnimals, icon: <Bird className="w-5 h-5 text-maroni-600" />, color: 'bg-maroni-50' },
            { label: 'Ce mois', value: dashboard.recentVisits.length, icon: <TrendingUp className="w-5 h-5 text-laterite-600" />, color: 'bg-laterite-50' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4 border border-border`}>
              <div className="flex items-center gap-2 mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input pl-9 w-full" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input">
          <option value="">Tous les types</option>
          {Object.entries(visitTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input" placeholder="Du" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input" placeholder="Au" />
      </div>

      {/* Tableau des visites */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 card">
          <Stethoscope className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune visite trouvée</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Animal', 'Type', 'Date', 'Vétérinaire', 'Diagnostic', 'Prochain RDV', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(visit => (
                <tr key={visit.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/animaux/${visit.animal.id}`} className="font-medium text-foreground hover:text-forest-600 transition-colors">
                      {visit.animal.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{visit.animal.species.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${visitTypeColors[visit.type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                      {visitTypeLabels[visit.type] || visit.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(visit.visitDate).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-foreground">{visit.vetName}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{visit.diagnosis || '—'}</td>
                  <td className="px-4 py-3">
                    {visit.nextVisitDate ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${new Date(visit.nextVisitDate) < new Date() ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {new Date(visit.nextVisitDate).toLocaleDateString('fr-FR')}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/animaux/${visit.animal.id}?tab=medical`} className="text-xs text-forest-600 hover:underline">
                      Voir animal
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modale Nouvelle visite */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-forest-600" />
                Nouvelle visite médicale
              </h2>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Animal <span className="text-red-500">*</span></label>
                <select
                  value={form.animalId}
                  onChange={e => setForm(f => ({ ...f, animalId: e.target.value }))}
                  className="input w-full"
                  required
                >
                  <option value="">Sélectionner un animal...</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>{a.name} — {a.species?.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Type de visite <span className="text-red-500">*</span></label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="input w-full"
                    required
                  >
                    {Object.entries(visitTypeLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Date de visite <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={form.visitDate}
                    onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))}
                    className="input w-full"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Vétérinaire <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.vetName}
                  onChange={e => setForm(f => ({ ...f, vetName: e.target.value }))}
                  placeholder="Dr. Nom Prénom"
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Diagnostic</label>
                <textarea
                  value={form.diagnosis}
                  onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                  placeholder="Diagnostic ou observations..."
                  className="input w-full h-20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes complémentaires..."
                  className="input w-full h-16 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.weight}
                    onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                    placeholder="Ex: 2.5"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Température (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.temperature}
                    onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))}
                    placeholder="Ex: 38.5"
                    className="input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Prochain rendez-vous</label>
                <input
                  type="date"
                  value={form.nextVisitDate}
                  onChange={e => setForm(f => ({ ...f, nextVisitDate: e.target.value }))}
                  className="input w-full"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(''); }}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Créer la visite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
