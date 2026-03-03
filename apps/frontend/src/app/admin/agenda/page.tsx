'use client';

import { useState } from 'react';

interface AgendaEvent {
  id: string;
  title: string;
  type: 'MEDICAL' | 'FEEDING' | 'CLEANING' | 'TRAINING' | 'INSPECTION' | 'OTHER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  date: string;
  time?: string;
  animal?: string;
  enclosure?: string;
  assignedTo?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  recurrence?: string;
}

const MOCK_EVENTS: AgendaEvent[] = [
  { id: '1', title: 'Visite vétérinaire — Amazona', type: 'MEDICAL', priority: 'HIGH', date: '2026-03-01', time: '09:00', animal: 'Amazona', assignedTo: 'Dr. Rousseau', status: 'PENDING' },
  { id: '2', title: 'Alimentation Reptilarium', type: 'FEEDING', priority: 'NORMAL', date: '2026-03-01', time: '08:00', enclosure: 'REP-01', assignedTo: 'Marie Dupont', status: 'COMPLETED', recurrence: 'DAILY' },
  { id: '3', title: 'Nettoyage Volière A', type: 'CLEANING', priority: 'NORMAL', date: '2026-03-02', time: '10:00', enclosure: 'VTA-01', assignedTo: 'Pierre Leblanc', status: 'PENDING', recurrence: 'WEEKLY' },
  { id: '4', title: 'Formation soigneurs — Module 4', type: 'TRAINING', priority: 'LOW', date: '2026-03-03', time: '14:00', assignedTo: 'Jean Martin', status: 'PENDING' },
  { id: '5', title: 'Inspection CITES — Ara Bleu', type: 'INSPECTION', priority: 'URGENT', date: '2026-03-05', time: '11:00', animal: 'Ara Bleu', assignedTo: 'Dr. Rousseau', status: 'PENDING' },
  { id: '6', title: 'Vaccination Caïman #3', type: 'MEDICAL', priority: 'HIGH', date: '2026-03-07', time: '09:30', animal: 'Caïman #3', assignedTo: 'Dr. Rousseau', status: 'PENDING' },
  { id: '7', title: 'Nettoyage Amphibiarium', type: 'CLEANING', priority: 'NORMAL', date: '2026-03-08', time: '09:00', enclosure: 'AMP-01', assignedTo: 'Marie Dupont', status: 'PENDING', recurrence: 'WEEKLY' },
  { id: '8', title: 'Pesée mensuelle animaux', type: 'MEDICAL', priority: 'NORMAL', date: '2026-03-10', time: '08:00', assignedTo: 'Marie Dupont', status: 'PENDING', recurrence: 'MONTHLY' },
  { id: '9', title: 'Alimentation Volière A', type: 'FEEDING', priority: 'NORMAL', date: '2026-03-15', time: '07:30', enclosure: 'VTA-01', assignedTo: 'Pierre Leblanc', status: 'PENDING', recurrence: 'DAILY' },
  { id: '10', title: 'Contrôle température enclos', type: 'INSPECTION', priority: 'NORMAL', date: '2026-03-20', time: '10:00', assignedTo: 'Jean Martin', status: 'PENDING', recurrence: 'WEEKLY' },
];

const TYPE_CONFIG = {
  MEDICAL: { emoji: '🩺', color: 'bg-red-100 text-red-700 border-red-200', label: 'Médical' },
  FEEDING: { emoji: '🌿', color: 'bg-green-100 text-green-700 border-green-200', label: 'Alimentation' },
  CLEANING: { emoji: '🧹', color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Nettoyage' },
  TRAINING: { emoji: '📚', color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Formation' },
  INSPECTION: { emoji: '🔍', color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Inspection' },
  OTHER: { emoji: '📌', color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Autre' },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Basse', color: 'text-gray-500' },
  NORMAL: { label: 'Normale', color: 'text-blue-600' },
  HIGH: { label: 'Haute', color: 'text-orange-600' },
  URGENT: { label: 'Urgente', color: 'text-red-600' },
};

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Lundi = 0
  const days: (number | null)[] = [];

  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

export default function AgendaPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);

  const calendarDays = getCalendarDays(currentYear, currentMonth);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return MOCK_EVENTS.filter(e => e.date === dateStr && (filterType === 'ALL' || e.type === filterType));
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📅 Agenda des soins</h1>
          <p className="text-gray-500 text-sm mt-1">Planning des soins, visites et événements</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/agenda/export/ical"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <span>📥</span> Export iCal
          </a>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 transition-colors"
          >
            + Nouvel événement
          </button>
        </div>
      </div>

      {/* Filtres et vue */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['month', 'week', 'list'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Liste'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterType === 'ALL' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            Tous
          </button>
          {Object.entries(TYPE_CONFIG).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterType === type ? config.color + ' border-current' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {config.emoji} {config.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier mensuel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-semibold text-gray-900">{MONTHS[currentMonth]} {currentYear}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const events = day ? getEventsForDay(day) : [];
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <div
                  key={index}
                  onClick={() => day && setSelectedDay(day)}
                  className={`min-h-[80px] p-2 border-b border-r border-gray-100 cursor-pointer transition-colors ${
                    day ? 'hover:bg-forest-50' : 'bg-gray-50'
                  } ${isSelected ? 'bg-forest-50' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${
                        isToday ? 'bg-forest-600 text-white' : isSelected ? 'bg-forest-100 text-forest-700' : 'text-gray-700'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {events.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-1.5 py-0.5 rounded truncate border ${TYPE_CONFIG[event.type].color}`}
                          >
                            {TYPE_CONFIG[event.type].emoji} {event.title.substring(0, 15)}
                          </div>
                        ))}
                        {events.length > 2 && (
                          <div className="text-xs text-gray-400 px-1">+{events.length - 2} autres</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panneau latéral — événements du jour */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">
              {selectedDay
                ? `${selectedDay} ${MONTHS[currentMonth]} ${currentYear}`
                : 'Sélectionner un jour'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{selectedDayEvents.length} événement(s)</p>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm">Aucun événement ce jour</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-3 text-xs text-forest-600 hover:text-forest-700 font-medium"
                >
                  + Ajouter un événement
                </button>
              </div>
            ) : (
              selectedDayEvents.map(event => (
                <div key={event.id} className={`p-3 rounded-xl border ${TYPE_CONFIG[event.type].color}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{TYPE_CONFIG[event.type].emoji}</span>
                      <div>
                        <div className="font-medium text-sm">{event.title}</div>
                        {event.time && <div className="text-xs opacity-70">🕐 {event.time}</div>}
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${PRIORITY_CONFIG[event.priority].color}`}>
                      {PRIORITY_CONFIG[event.priority].label}
                    </span>
                  </div>
                  <div className="mt-2 space-y-0.5 text-xs opacity-80">
                    {event.animal && <div>🦜 {event.animal}</div>}
                    {event.enclosure && <div>🏠 {event.enclosure}</div>}
                    {event.assignedTo && <div>👤 {event.assignedTo}</div>}
                    {event.recurrence && event.recurrence !== 'NONE' && (
                      <div>🔄 Récurrence : {event.recurrence === 'DAILY' ? 'Quotidienne' : event.recurrence === 'WEEKLY' ? 'Hebdomadaire' : 'Mensuelle'}</div>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    {event.status === 'PENDING' && (
                      <button className="text-xs px-2 py-1 bg-white/60 rounded hover:bg-white/80 transition-colors font-medium">
                        ✓ Compléter
                      </button>
                    )}
                    <button className="text-xs px-2 py-1 bg-white/60 rounded hover:bg-white/80 transition-colors">
                      Modifier
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Prochains événements urgents */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">⚠️ Événements urgents à venir</h3>
        <div className="space-y-3">
          {MOCK_EVENTS.filter(e => e.priority === 'URGENT' || e.priority === 'HIGH').map(event => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">{TYPE_CONFIG[event.type].emoji}</span>
                <div>
                  <div className="font-medium text-sm text-gray-900">{event.title}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('fr-FR')} {event.time ? `à ${event.time}` : ''} · {event.assignedTo}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                event.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {PRIORITY_CONFIG[event.priority].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal création événement (simplifié) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Nouvel événement</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input type="text" placeholder="Titre de l'événement" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500">
                    {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                      <option key={type} value={type}>{config.emoji} {config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500">
                    {Object.entries(PRIORITY_CONFIG).map(([p, config]) => (
                      <option key={p} value={p}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Récurrence</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500">
                  <option value="NONE">Aucune</option>
                  <option value="DAILY">Quotidienne</option>
                  <option value="WEEKLY">Hebdomadaire</option>
                  <option value="MONTHLY">Mensuelle</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700">Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
