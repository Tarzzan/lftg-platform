'use client';
import { useState } from 'react';

const EMPLOYEES = [
  { id: 'emp-001', nom: 'William MERI', avatar: '👨‍💼', couleur: 'bg-purple-200 text-purple-800' },
  { id: 'emp-002', nom: 'Marie Dupont', avatar: '👩‍🔬', couleur: 'bg-green-200 text-green-800' },
  { id: 'emp-003', nom: 'Dr. Rousseau', avatar: '👨‍⚕️', couleur: 'bg-blue-200 text-blue-800' },
  { id: 'emp-004', nom: 'Jean Martin', avatar: '📦', couleur: 'bg-orange-200 text-orange-800' },
  { id: 'emp-005', nom: 'Sophie Bernard', avatar: '👩‍🎓', couleur: 'bg-pink-200 text-pink-800' },
];

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DATES = ['03/03', '04/03', '05/03', '06/03', '07/03', '08/03', '09/03'];

const SHIFTS: Record<string, Record<string, { type: string; heures: string; zone: string }>> = {
  'emp-002': {
    '03/03': { type: 'Matin', heures: '07:00–15:00', zone: 'Volière A+B' },
    '05/03': { type: 'Matin', heures: '07:00–15:00', zone: 'Reptilarium' },
    '07/03': { type: 'Matin', heures: '07:00–15:00', zone: 'Volière A+B' },
  },
  'emp-003': {
    '04/03': { type: 'Matin', heures: '09:00–17:00', zone: 'Infirmerie' },
    '07/03': { type: 'Matin', heures: '09:00–17:00', zone: 'Infirmerie' },
  },
  'emp-004': {
    '03/03': { type: 'Après-midi', heures: '13:00–21:00', zone: 'Stock' },
    '06/03': { type: 'Matin', heures: '08:00–16:00', zone: 'Stock' },
  },
  'emp-005': {
    '03/03': { type: 'Après-midi', heures: '13:00–21:00', zone: 'Reptilarium' },
    '05/03': { type: 'Après-midi', heures: '13:00–21:00', zone: 'Reptilarium' },
    '08/03': { type: 'Weekend', heures: '09:00–17:00', zone: 'Toutes zones' },
    '09/03': { type: 'Weekend', heures: '09:00–17:00', zone: 'Toutes zones' },
  },
  'emp-001': {
    '04/03': { type: 'Matin', heures: '08:00–17:00', zone: 'Direction' },
    '05/03': { type: 'Matin', heures: '08:00–17:00', zone: 'Direction' },
    '06/03': { type: 'Matin', heures: '08:00–17:00', zone: 'Direction' },
  },
};

const TYPE_COLORS: Record<string, string> = {
  Matin: 'bg-blue-100 text-blue-800 border-blue-200',
  'Après-midi': 'bg-amber-100 text-amber-800 border-amber-200',
  Nuit: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Weekend: 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function PlanningPage() {
  const [view, setView] = useState<'semaine' | 'liste'>('semaine');
  const [showModal, setShowModal] = useState(false);

  const isWeekend = (date: string) => date === '08/03' || date === '09/03';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning des gardes</h1>
          <p className="text-sm text-gray-500 mt-1">Semaine du 3 au 9 mars 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('semaine')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'semaine' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Semaine
            </button>
            <button
              onClick={() => setView('liste')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'liste' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Liste
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors text-sm font-medium"
          >
            + Ajouter un créneau
          </button>
        </div>
      </div>

      {/* Navigation semaine */}
      <div className="flex items-center gap-4">
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">←</button>
        <span className="text-sm font-medium text-gray-700">Semaine 10 — Mars 2026</span>
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">→</button>
        <button className="ml-auto text-sm text-forest-600 hover:text-forest-700 font-medium">Aujourd'hui</button>
      </div>

      {view === 'semaine' ? (
        /* Vue calendrier semaine */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* En-têtes jours */}
          <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '160px repeat(7, 1fr)' }}>
            <div className="p-3 bg-gray-50 border-r border-gray-100" />
            {DAYS.map((day, i) => (
              <div
                key={day}
                className={`p-3 text-center border-r border-gray-100 last:border-r-0 ${isWeekend(DATES[i]) ? 'bg-purple-50' : 'bg-gray-50'}`}
              >
                <div className="text-xs font-medium text-gray-500">{day}</div>
                <div className={`text-sm font-bold mt-0.5 ${isWeekend(DATES[i]) ? 'text-purple-700' : 'text-gray-900'}`}>{DATES[i]}</div>
              </div>
            ))}
          </div>

          {/* Lignes employés */}
          {EMPLOYEES.map(emp => (
            <div key={emp.id} className="grid border-b border-gray-50 last:border-b-0" style={{ gridTemplateColumns: '160px repeat(7, 1fr)' }}>
              <div className="p-3 border-r border-gray-100 flex items-center gap-2">
                <span className="text-lg">{emp.avatar}</span>
                <div>
                  <div className="text-xs font-medium text-gray-900 leading-tight">{emp.nom.split(' ')[0]}</div>
                  <div className="text-xs text-gray-400">{emp.nom.split(' ').slice(1).join(' ')}</div>
                </div>
              </div>
              {DATES.map(date => {
                const shift = SHIFTS[emp.id]?.[date];
                return (
                  <div
                    key={date}
                    className={`p-2 border-r border-gray-50 last:border-r-0 min-h-16 ${isWeekend(date) ? 'bg-purple-50/30' : ''}`}
                  >
                    {shift && (
                      <div className={`rounded-lg border p-2 text-xs ${TYPE_COLORS[shift.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        <div className="font-semibold">{shift.type}</div>
                        <div className="opacity-75 mt-0.5">{shift.heures}</div>
                        <div className="opacity-60 truncate">{shift.zone}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        /* Vue liste */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {EMPLOYEES.flatMap(emp =>
              DATES.map(date => {
                const shift = SHIFTS[emp.id]?.[date];
                if (!shift) return null;
                return (
                  <div key={`${emp.id}-${date}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-20 text-sm font-medium text-gray-700">{date}</div>
                    <span className="text-xl">{emp.avatar}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{emp.nom}</div>
                      <div className="text-xs text-gray-500">{shift.zone}</div>
                    </div>
                    <div className="text-sm text-gray-600">{shift.heures}</div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${TYPE_COLORS[shift.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {shift.type}
                    </span>
                  </div>
                );
              }).filter(Boolean)
            )}
          </div>
        </div>
      )}

      {/* Légende */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">Légende :</span>
        {Object.entries(TYPE_COLORS).map(([type, cls]) => (
          <span key={type} className={`text-xs px-2 py-1 rounded-full border font-medium ${cls}`}>{type}</span>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Nouveau créneau de garde</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employé</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  {EMPLOYEES.map(e => <option key={e.id}>{e.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Heure début</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" defaultValue="07:00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Heure fin</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" defaultValue="15:00" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option>Matin</option>
                  <option>Après-midi</option>
                  <option>Nuit</option>
                  <option>Weekend</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Zone</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Ex: Volière A+B" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                Annuler
              </button>
              <button className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700">
                Créer le créneau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
