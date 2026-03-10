'use client';
import { toast } from 'sonner';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit2, User } from 'lucide-react';
import { personnelApi, usersApi } from '@/lib/api';

const DEPT_COLORS: Record<string, string> = {
  Direction: 'bg-purple-100 text-purple-800',
  Soins: 'bg-green-100 text-green-800',
  Médical: 'bg-blue-100 text-blue-800',
  Logistique: 'bg-orange-100 text-orange-800',
  Élevage: 'bg-yellow-100 text-yellow-800',
  Formation: 'bg-indigo-100 text-indigo-800',
};

export default function EmployesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any>(null);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['personnel-employees'],
    queryFn: personnelApi.employees,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => personnelApi.deleteEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personnel-employees'] }),
  });

  const filtered = useMemo(() => {
    let list = employees as any[];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e: any) =>
        (e.firstName ?? '').toLowerCase().includes(q) ||
        (e.lastName ?? '').toLowerCase().includes(q) ||
        (e.jobTitle ?? '').toLowerCase().includes(q) ||
        (e.email ?? '').toLowerCase().includes(q)
      );
    }
    if (filterDept) list = list.filter((e: any) => e.department === filterDept);
    return list;
  }, [employees, search, filterDept]);

  const depts = [...new Set((employees as any[]).map((e: any) => e.department).filter(Boolean))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-gray-100">Employés</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{(employees as any[]).length} membre{(employees as any[]).length !== 1 ? 's' : ''} du personnel</p>
        </div>
        <button
          onClick={() => { setEditEmployee(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Nouvel employé
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-border dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-border dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-white dark:bg-gray-700"
            />
          </div>
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-border dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-white dark:bg-gray-700"
          >
            <option value="">Tous les départements</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-border dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-border dark:border-gray-700 bg-gray-50 dark:bg-muted/20 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Employé</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Poste</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Département</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date embauche</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Aucun employé trouvé
                </td>
              </tr>
            ) : filtered.map((emp: any) => (
              <tr key={emp.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:bg-muted/20 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-forest-100 dark:bg-forest-900 rounded-full flex items-center justify-center text-sm font-semibold text-forest-700 dark:text-forest-300">
                      {(emp.firstName?.[0] ?? '').toUpperCase()}{(emp.lastName?.[0] ?? '').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-foreground dark:text-gray-100">{emp.firstName} {emp.lastName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">{emp.jobTitle ?? '—'}</td>
                <td className="px-4 py-3">
                  {emp.department ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DEPT_COLORS[emp.department] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-800'}`}>
                      {emp.department}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{emp.email ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <a
                      href={`/admin/personnel/employes/${emp.id}`}
                      className="px-2.5 py-1.5 text-xs font-medium bg-forest-50 text-forest-700 rounded-lg hover:bg-forest-100 transition-colors"
                    >
                      Fiche
                    </a>
                    <button
                      onClick={() => { setEditEmployee(emp); setShowModal(true); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Supprimer cet employé ?')) deleteMutation.mutate(emp.id); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal création/édition employé */}
      {showModal && (
        <EmployeeModal
          employee={editEmployee}
          users={users}
          onClose={() => { setShowModal(false); setEditEmployee(null); }}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['personnel-employees'] });
            setShowModal(false);
            setEditEmployee(null);
          }}
        />
      )}
    </div>
  );
}

function EmployeeModal({ employee, users, onClose, onSuccess }: { employee: any; users: any; onClose: () => void; onSuccess: () => void }) {
  const isEdit = !!employee;
  const [form, setForm] = useState({
    userId: employee?.userId ?? '',
    firstName: employee?.firstName ?? '',
    lastName: employee?.lastName ?? '',
    email: employee?.email ?? '',
    phone: employee?.phone ?? '',
    jobTitle: employee?.jobTitle ?? '',
    department: employee?.department ?? '',
    hireDate: employee?.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError('');
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Le prénom et le nom sont requis');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await personnelApi.updateEmployee(employee.id, form);
      } else {
        // Si pas de userId sélectionné, on en génère un temporaire
        const payload = { ...form };
        if (!payload.userId) {
          payload.userId = `temp-${Date.now()}`;
        }
        await personnelApi.createEmployee(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-foreground dark:text-gray-100">
            {isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Utilisateur lié (optionnel)</label>
              <select
                value={form.userId}
                onChange={set('userId')}
                className="w-full px-3 py-2 border border-gray-200 dark:border-border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
              >
                <option value="">— Aucun utilisateur —</option>
                {(users as any[]).map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Prénom *</label>
              <input value={form.firstName} onChange={set('firstName')} className="w-full px-3 py-2 border border-gray-200 dark:border-border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700" placeholder="Prénom" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Nom *</label>
              <input value={form.lastName} onChange={set('lastName')} className="w-full px-3 py-2 border border-gray-200 dark:border-border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700" placeholder="Nom" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className="w-full px-3 py-2 border border-gray-200 dark:border-border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700" placeholder="email@lftg.fr" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Téléphone</label>
              <input value={form.phone} onChange={set('phone')} className="w-full px-3 py-2 border border-gray-200 dark:border-border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700" placeholder="0694..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Poste</label>
            <input value={form.jobTitle} onChange={set('jobTitle')} className="w-full px-3 py-2 border border-gray-200 dark:border-border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700" placeholder="Intitulé du poste" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Département</label>
              <select value={form.department} onChange={set('department')} className="w-full px-3 py-2 border border-gray-200 dark:border-border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700">
                <option value="">— Sélectionner —</option>
                <option>Direction</option>
                <option>Soins</option>
                <option>Médical</option>
                <option>Logistique</option>
                <option>Élevage</option>
                <option>Formation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Date d&apos;embauche</label>
              <input type="date" value={form.hireDate} onChange={set('hireDate')} className="w-full px-3 py-2 border border-gray-200 dark:border-border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700" />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 dark:border-border text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:bg-gray-900">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 disabled:opacity-50">
              {loading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer l\'employé'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
