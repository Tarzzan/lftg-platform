'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { personnelApi } from '@/lib/api';

interface Employee {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  hireDate?: string;
  skills?: Skill[];
  leaves?: Leave[];
  documents?: Document[];
}

interface Skill {
  id: string;
  name: string;
  level?: string;
}

interface Leave {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status?: string;
}

const TABS = ['Fiche personnelle', 'Compétences', 'Congés & Absences'];

const LEAVE_STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Employee>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    personnelApi.getEmployee(id)
      .then((data) => {
        setEmployee(data);
        setEditData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          jobTitle: data.jobTitle,
          department: data.department,
        });
      })
      .catch((e: any) => setError(e?.response?.data?.message || 'Employé introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const updated = await personnelApi.updateEmployee(id, editData);
      setEmployee(updated);
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Chargement du dossier employé...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6">
        <Link href="/admin/personnel/employes" className="text-gray-400 hover:text-gray-600 dark:text-gray-400 text-sm mb-4 inline-block">
          ← Retour aux employés
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">{error || 'Employé introuvable'}</p>
          <button
            onClick={() => router.push('/admin/personnel/employes')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const initials = `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/personnel/employes" className="hover:text-gray-700">Employés</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-foreground font-medium">{fullName}</span>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">Dossier mis à jour avec succès</div>
      )}

      {/* Carte employé */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-gray-500">{employee.jobTitle ?? 'Poste non renseigné'}</p>
              <p className="text-sm text-gray-400">{employee.department ?? 'Département non renseigné'}</p>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {editing ? 'Annuler' : '️ Modifier'}
          </button>
        </div>

        {editing && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-border grid grid-cols-1 md:grid-cols-2 gap-4">
            {saveError && (
              <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {saveError}
              </div>
            )}
            {[
              { key: 'firstName', label: 'Prénom' },
              { key: 'lastName', label: 'Nom' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Téléphone' },
              { key: 'jobTitle', label: 'Poste' },
              { key: 'department', label: 'Département' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <input
                  value={(editData as any)[key] ?? ''}
                  onChange={(e) => setEditData((d) => ({ ...d, [key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div className="col-span-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-border">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-sm font-medium ${activeTab === i ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Fiche personnelle */}
        {activeTab === 0 && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Informations de contact</h3>
              {[
                { label: 'Email', value: employee.email },
                { label: 'Téléphone', value: employee.phone },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{value ?? '—'}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Informations professionnelles</h3>
              {[
                { label: 'Poste', value: employee.jobTitle },
                { label: 'Département', value: employee.department },
                { label: "Date d'embauche", value: employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR') :'—'},
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{value ??'—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compétences */}
        {activeTab === 1 && (
          <div className="p-6">
            {(!employee.skills || employee.skills.length === 0) ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-3"></p>
                <p className="font-medium text-gray-600">Aucune compétence enregistrée</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill) => (
                  <span key={skill.id} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {skill.name}
                    {skill.level && <span className="ml-1 text-blue-400 text-xs">· {skill.level}</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Congés */}
        {activeTab === 2 && (
          <div className="p-4">
            {(!employee.leaves || employee.leaves.length === 0) ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-3"></p>
                <p className="font-medium text-gray-600">Aucun congé enregistré</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-muted/20 text-xs text-gray-500 dark:text-gray-400 uppercase">
                    <tr>
                      {['Type','Début','Fin','Statut'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employee.leaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50 dark:bg-gray-900">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-foreground capitalize">{leave.type}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(leave.startDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEAVE_STATUS_COLORS[leave.status ??''] ??'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                            {leave.status ??'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
