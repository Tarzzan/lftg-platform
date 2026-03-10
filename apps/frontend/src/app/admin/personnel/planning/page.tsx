'use client';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const TYPE_COLORS: Record<string, string> = {
  Matin: 'bg-blue-100 text-blue-800 border-blue-200',
  'Après-midi': 'bg-amber-100 text-amber-800 border-amber-200',
  Nuit: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Weekend: 'bg-purple-100 text-purple-800 border-purple-200',
};

const DEPT_COLORS: Record<string, string> = {
  Direction: 'bg-purple-100 text-purple-800',
  Soins: 'bg-green-100 text-green-800',
  Médical: 'bg-blue-100 text-blue-800',
  Logistique: 'bg-orange-100 text-orange-800',
  Élevage: 'bg-yellow-100 text-yellow-800',
  Formation: 'bg-indigo-100 text-indigo-800',
};

function getWeekDates(offset = 0) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function PlanningPage() {
  const [view, setView] = useState<'semaine' | 'liste'>('semaine');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDept, setSelectedDept] = useState('');

  const { data: employees = [], isLoading, isError, error } = useQuery({
    queryKey: ['personnel-employees'],
    queryFn: () => api.get('/plugins/personnel/employees').then(r => r.data),
  });

  const { data: leaves = [] } = useQuery({
    queryKey: ['personnel-leaves'],
    queryFn: () => api.get('/plugins/personnel/leaves').then(r => r.data),
  });

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const filteredEmployees = useMemo(() => {
    let list = employees as any[];
    if (selectedDept) list = list.filter((e: any) => e.department === selectedDept);
    return list;
  }, [employees, selectedDept]);

  const departments = useMemo(() => {
    const depts = new Set((employees as any[]).map((e: any) => e.department).filter(Boolean));
    return Array.from(depts);
  }, [employees]);

  const isOnLeave = (employeeId: string, date: Date) => {
    return (leaves as any[]).some((l: any) => {
      if (l.employeeId !== employeeId) return false;
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      return date >= start && date <= end && (l.status === 'APPROVED' || l.status === 'PENDING');
    });
  };

  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning des gardes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Semaine du {weekDates[0].toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })} au {weekDates[6].toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {departments.length > 0 && (
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tous les départements</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button onClick={() => setView('semaine')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'semaine' ? 'bg-white dark:bg-gray-800 shadow-sm font-medium' : 'text-gray-500'}`}>
              Semaine
            </button>
            <button onClick={() => setView('liste')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'liste' ? 'bg-white dark:bg-gray-800 shadow-sm font-medium' : 'text-gray-500'}`}>
              Liste
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600">←</button>
            <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600">Aujourd'hui</button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600">→</button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600" />
          <span className="ml-3 text-gray-500">Chargement du planning...</span>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-500">Aucun employé trouvé.</p>
        </div>
      ) : view === 'semaine' ? (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-muted/20 border-b border-gray-200 dark:border-border">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium w-48">Employé</th>
                  {weekDates.map((date, i) => (
                    <th key={i} className={`text-center py-3 px-2 text-gray-600 dark:text-gray-400 font-medium min-w-24 ${isWeekend(date) ? 'bg-gray-100' : ''}`}>
                      <div className="font-medium">{DAYS[i]}</div>
                      <div className="text-xs text-gray-400">{date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp: any) => (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 dark:bg-gray-900">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-forest-100 flex items-center justify-center text-xs font-bold text-forest-700">
                          {(emp.firstName || emp.lastName || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-foreground text-xs">{emp.firstName} {emp.lastName}</div>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${DEPT_COLORS[emp.department] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                            {emp.department || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date, i) => {
                      const onLeave = isOnLeave(emp.id, date);
                      const weekend = isWeekend(date);
                      return (
                        <td key={i} className={`py-2 px-1 text-center ${weekend ? 'bg-gray-50' : ''}`}>
                          {onLeave ? (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded border border-amber-200">
                              Congé
                            </span>
                          ) : weekend ? (
                            <span className="text-xs text-gray-300">—</span>
                          ) : (
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100">
                              Présent
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((emp: any) => {
            const empLeaves = (leaves as any[]).filter((l: any) => l.employeeId === emp.id);
            return (
              <div key={emp.id} className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-sm font-bold text-forest-700">
                    {(emp.firstName || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</div>
                    <div className="text-xs text-gray-500">{emp.jobTitle} · {emp.department}</div>
                  </div>
                  {emp.email && <span className="ml-auto text-xs text-gray-400">{emp.email}</span>}
                </div>
                {empLeaves.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">Congés / Absences :</p>
                    {empLeaves.map((leave: any) => (
                      <div key={leave.id} className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <span className="font-medium text-amber-700">{leave.type || 'Congé'}</span>
                        <span className="text-gray-500">
                          {new Date(leave.startDate).toLocaleDateString('fr-FR')} → {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span className={`ml-auto px-2 py-0.5 rounded font-medium ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' : leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                          {leave.status === 'APPROVED' ? 'Approuvé' : leave.status === 'PENDING' ? 'En attente' : leave.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Aucun congé planifié</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Légende */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
        <span className="font-medium">Légende :</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-200 inline-block"></span> Présent</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200 inline-block"></span> Congé</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-border inline-block"></span> Weekend</span>
      </div>
    </div>
  );
}
