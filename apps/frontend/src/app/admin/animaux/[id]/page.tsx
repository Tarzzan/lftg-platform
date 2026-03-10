'use client';
import { toast } from 'sonner';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Bird, Calendar, Weight, Thermometer, Stethoscope,
  Syringe, Pill, Plus, Edit, Camera, FileText, AlertCircle,
  CheckCircle, Clock, MapPin, Tag, Activity, Heart,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Animal {
  id: string;
  name: string;
  identifier?: string;
  sex: string;
  birthDate?: string;
  status: string;
  notes?: string;
  species: { name: string; scientificName?: string };
  enclosure?: { name: string };
}

interface MedicalVisit {
  id: string;
  type: string;
  visitDate: string;
  vetName: string;
  diagnosis?: string;
  notes?: string;
  weight?: number;
  temperature?: number;
  nextVisitDate?: string;
  treatments: Treatment[];
  vaccinations: Vaccination[];
}

interface Treatment {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate: string;
  endDate?: string;
  completed: boolean;
  notes?: string;
}

interface Vaccination {
  id: string;
  vaccine: string;
  batchNumber?: string;
  administeredDate: string;
  nextDueDate?: string;
  notes?: string;
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AnimalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'vaccinations' | 'treatments'>('overview');
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState({
    type: 'ROUTINE',
    visitDate: new Date().toISOString().split('T')[0],
    vetName: '',
    diagnosis: '',
    notes: '',
    weight: '',
    temperature: '',
    nextVisitDate: '',
  });

  // ─── Données ────────────────────────────────────────────────────────────────

  const { data: animal, isLoading: animalLoading, isError: animalError } = useQuery<Animal>({
    queryKey: ['animal', id],
    queryFn: () => api.get(`/plugins/animaux/animals/${id}`).then(r => r.data),
  });

  const { data: medicalHistory, isLoading: medicalLoading, isError: medicalError } = useQuery<{ visits: MedicalVisit[]; totalVisits: number }>({
    queryKey: ['animal-medical', id],
    queryFn: () => api.get(`/medical/animals/${id}/history`).then(r => r.data),
  });

  const createVisitMutation = useMutation({
    mutationFn: (data: any) => api.post('/medical/visits', { ...data, animalId: id }),
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['animal-medical', id] });
      setShowVisitModal(false);
      setVisitForm({ type: 'ROUTINE', visitDate: new Date().toISOString().split('T')[0], vetName: '', diagnosis: '', notes: '', weight: '', temperature: '', nextVisitDate: '' });
    },
  });

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    ACTIVE: { label: 'Actif', color: 'text-green-700 bg-green-50 border-green-200', icon: <CheckCircle className="w-3 h-3" /> },
    SICK: { label: 'Malade', color: 'text-red-700 bg-red-50 border-red-200', icon: <AlertCircle className="w-3 h-3" /> },
    QUARANTINE: { label: 'Quarantaine', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: <AlertCircle className="w-3 h-3" /> },
    DECEASED: { label: 'Décédé', color: 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-muted/20 border-gray-200 dark:border-border', icon: <Clock className="w-3 h-3" /> },
    TRANSFERRED: { label: 'Transféré', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: <MapPin className="w-3 h-3" /> },
  };

  const visitTypeLabels: Record<string, string> = {
    ROUTINE: 'Visite de routine',
    EMERGENCY: 'Urgence',
    SURGERY: 'Chirurgie',
    VACCINATION: 'Vaccination',
    CHECKUP: 'Bilan de santé',
    FOLLOWUP: 'Suivi',
  };

  const sexLabels: Record<string, string> = {
    MALE: 'Mâle',
    FEMALE: 'Femelle',
    UNKNOWN: 'Inconnu',
  };

  if (animalLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="text-center py-16">
        <Bird className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Animal introuvable</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">Retour</button>
      </div>
    );
  }

  const status = statusConfig[animal.status] || statusConfig.ACTIVE;
  const visits = medicalHistory?.visits || [];
  const allVaccinations = visits.flatMap(v => v.vaccinations);
  const allTreatments = visits.flatMap(v => v.treatments);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="mt-1 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-display font-bold text-foreground">{animal.name}</h1>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
          </div>
          <p className="text-muted-foreground">
            <span className="font-medium">{animal.species.name}</span>
            {animal.species.scientificName && (
              <span className="italic ml-1">({animal.species.scientificName})</span>
            )}
            {animal.identifier && <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded font-mono">{animal.identifier}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Photo
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Visites médicales', value: medicalHistory?.totalVisits ?? 0, icon: <Stethoscope className="w-5 h-5 text-forest-600" />, color: 'bg-forest-50' },
          { label: 'Vaccinations', value: allVaccinations.length, icon: <Syringe className="w-5 h-5 text-maroni-600" />, color: 'bg-maroni-50' },
          { label: 'Traitements actifs', value: allTreatments.filter(t => !t.completed).length, icon: <Pill className="w-5 h-5 text-laterite-600" />, color: 'bg-laterite-50' },
          {
            label: 'Âge',
            value: animal.birthDate
              ? `${Math.floor((Date.now() - new Date(animal.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))} ans`
              : 'Inconnu',
            icon: <Calendar className="w-5 h-5 text-gold-600" />,
            color: 'bg-gold-50',
          },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-xl p-4 border border-border`}>
            <div className="flex items-center gap-2 mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Fiche', icon: <FileText className="w-4 h-4" /> },
            { id: 'medical', label: 'Historique médical', icon: <Activity className="w-4 h-4" /> },
            { id: 'vaccinations', label: 'Vaccinations', icon: <Syringe className="w-4 h-4" /> },
            { id: 'treatments', label: 'Traitements', icon: <Pill className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-forest-600 text-forest-700'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des tabs */}

      {/* Tab : Fiche */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bird className="w-4 h-4 text-forest-600" />
              Informations générales
            </h3>
            <dl className="space-y-3">
              {[
                { label: 'Nom', value: animal.name },
                { label: 'Identifiant', value: animal.identifier || '—' },
                { label: 'Espèce', value: animal.species.name },
                { label: 'Nom scientifique', value: animal.species.scientificName || '—' },
                { label: 'Sexe', value: sexLabels[animal.sex] || animal.sex },
                { label: 'Date de naissance', value: animal.birthDate ? new Date(animal.birthDate).toLocaleDateString('fr-FR') : '—' },
                { label: 'Statut', value: status.label },
                { label: 'Enclos', value: animal.enclosure?.name || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium text-foreground text-right max-w-[60%]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-laterite-600" />
              Notes & Observations
            </h3>
            {animal.notes ? (
              <p className="text-sm text-foreground leading-relaxed">{animal.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucune note enregistrée.</p>
            )}

            {/* Prochaine visite */}
            {visits.length > 0 && visits[0].nextVisitDate && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-medium text-amber-800 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Prochaine visite planifiée
                </p>
                <p className="text-sm font-bold text-amber-900 mt-1">
                  {new Date(visits[0].nextVisitDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab : Historique médical */}
      {activeTab === 'medical' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">
              {visits.length} visite{visits.length !== 1 ? 's' : ''} enregistrée{visits.length !== 1 ? 's' : ''}
            </h3>
            <button
              onClick={() => setShowVisitModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle visite
            </button>
          </div>

          {medicalLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-forest-600 border-t-transparent rounded-full" />
            </div>
          ) : visits.length === 0 ? (
            <div className="text-center py-12 card">
              <Stethoscope className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune visite médicale enregistrée</p>
              <button onClick={() => setShowVisitModal(true)} className="btn-primary mt-4">
                Enregistrer une visite
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4 pl-14">
                {visits.map((visit, idx) => (
                  <div key={visit.id} className="relative">
                    {/* Dot */}
                    <div className={`absolute -left-8 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      visit.type === 'EMERGENCY' ? 'bg-red-500' :
                      visit.type === 'VACCINATION' ? 'bg-blue-500' :
                      visit.type === 'SURGERY' ? 'bg-purple-500' : 'bg-forest-500'
                    }`} />

                    <div className="card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            visit.type === 'EMERGENCY' ? 'bg-red-100 text-red-700' :
                            visit.type === 'VACCINATION' ? 'bg-blue-100 text-blue-700' :
                            'bg-forest-100 text-forest-700'
                          }`}>
                            {visitTypeLabels[visit.type] || visit.type}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(visit.visitDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p className="font-medium text-foreground">{visit.vetName}</p>
                          {visit.weight && <p className="flex items-center gap-1 justify-end"><Weight className="w-3 h-3" />{visit.weight} kg</p>}
                          {visit.temperature && <p className="flex items-center gap-1 justify-end"><Thermometer className="w-3 h-3" />{visit.temperature}°C</p>}
                        </div>
                      </div>

                      {visit.diagnosis && (
                        <p className="text-sm text-foreground mb-2">
                          <span className="font-medium">Diagnostic :</span> {visit.diagnosis}
                        </p>
                      )}
                      {visit.notes && (
                        <p className="text-sm text-muted-foreground">{visit.notes}</p>
                      )}

                      {/* Traitements & vaccinations de cette visite */}
                      {(visit.treatments.length > 0 || visit.vaccinations.length > 0) && (
                        <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                          {visit.treatments.map(t => (
                            <span key={t.id} className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                              <Pill className="w-3 h-3" />{t.name}
                            </span>
                          ))}
                          {visit.vaccinations.map(v => (
                            <span key={v.id} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                              <Syringe className="w-3 h-3" />{v.vaccine}
                            </span>
                          ))}
                        </div>
                      )}

                      {visit.nextVisitDate && (
                        <div className="mt-2 text-xs text-amber-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Prochain RDV : {new Date(visit.nextVisitDate).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab : Vaccinations */}
      {activeTab === 'vaccinations' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">{allVaccinations.length} vaccination{allVaccinations.length !== 1 ? 's' : ''}</h3>
          {allVaccinations.length === 0 ? (
            <div className="text-center py-12 card">
              <Syringe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune vaccination enregistrée</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {['Vaccin', 'Date', 'N° lot', 'Prochain rappel', 'Notes'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allVaccinations.map(v => (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{v.vaccine}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(v.administeredDate).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{v.batchNumber || '—'}</td>
                      <td className="px-4 py-3">
                        {v.nextDueDate ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            new Date(v.nextDueDate) < new Date()
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {new Date(v.nextDueDate).toLocaleDateString('fr-FR')}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{v.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab : Traitements */}
      {activeTab === 'treatments' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">{allTreatments.length} traitement{allTreatments.length !== 1 ? 's' : ''}</h3>
          {allTreatments.length === 0 ? (
            <div className="text-center py-12 card">
              <Pill className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun traitement enregistré</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {allTreatments.map(t => (
                <div key={t.id} className={`card p-4 border-l-4 ${t.completed ? 'border-l-green-400 opacity-70' : 'border-l-orange-400'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <Pill className="w-4 h-4 text-orange-500" />
                        {t.name}
                        {t.completed && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Terminé</span>}
                      </p>
                      {t.dosage && <p className="text-sm text-muted-foreground mt-1">Dosage : {t.dosage}</p>}
                      {t.frequency && <p className="text-sm text-muted-foreground">Fréquence : {t.frequency}</p>}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Du {new Date(t.startDate).toLocaleDateString('fr-FR')}</p>
                      {t.endDate && <p>au {new Date(t.endDate).toLocaleDateString('fr-FR')}</p>}
                    </div>
                  </div>
                  {t.notes && <p className="text-xs text-muted-foreground mt-2 italic">{t.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal nouvelle visite */}
      <Modal
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
        title="Nouvelle visite médicale"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type de visite *</label>
              <select
                value={visitForm.type}
                onChange={e => setVisitForm(f => ({ ...f, type: e.target.value }))}
                className="input w-full"
              >
                {Object.entries(visitTypeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date *</label>
              <input
                type="date"
                value={visitForm.visitDate}
                onChange={e => setVisitForm(f => ({ ...f, visitDate: e.target.value }))}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Vétérinaire *</label>
            <input
              type="text"
              value={visitForm.vetName}
              onChange={e => setVisitForm(f => ({ ...f, vetName: e.target.value }))}
              placeholder="Dr. Martin"
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Poids (kg)</label>
              <input
                type="number"
                step="0.01"
                value={visitForm.weight}
                onChange={e => setVisitForm(f => ({ ...f, weight: e.target.value }))}
                placeholder="0.00"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Température (°C)</label>
              <input
                type="number"
                step="0.1"
                value={visitForm.temperature}
                onChange={e => setVisitForm(f => ({ ...f, temperature: e.target.value }))}
                placeholder="38.5"
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Diagnostic</label>
            <input
              type="text"
              value={visitForm.diagnosis}
              onChange={e => setVisitForm(f => ({ ...f, diagnosis: e.target.value }))}
              placeholder="Bilan de santé normal"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              value={visitForm.notes}
              onChange={e => setVisitForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Observations, recommandations..."
              className="input w-full resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Prochaine visite</label>
            <input
              type="date"
              value={visitForm.nextVisitDate}
              onChange={e => setVisitForm(f => ({ ...f, nextVisitDate: e.target.value }))}
              className="input w-full"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowVisitModal(false)} className="btn-secondary">Annuler</button>
            <button
              onClick={() => createVisitMutation.mutate({
                ...visitForm,
                weight: visitForm.weight ? parseFloat(visitForm.weight) : undefined,
                temperature: visitForm.temperature ? parseFloat(visitForm.temperature) : undefined,
                nextVisitDate: visitForm.nextVisitDate || undefined,
              })}
              disabled={!visitForm.vetName || !visitForm.visitDate || createVisitMutation.isPending}
              className="btn-primary"
            >
              {createVisitMutation.isPending ? 'Enregistrement...' : 'Enregistrer la visite'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
