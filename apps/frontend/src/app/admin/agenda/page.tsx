'use client';
import { toast } from 'sonner';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  type: 'MEDICAL' | 'FEEDING' | 'CLEANING' | 'TRAINING' | 'INSPECTION' | 'OTHER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  recurrence?: string;
  animal?: { id: string; name: string };
  enclosure?: { id: string; name: string; code: string };
  assignedTo?: { id: string; firstName: string; lastName: string };
}

const TYPE_CONFIG = {
  MEDICAL:    { emoji: '🩺', color: 'bg-red-100 text-red-700 border-red-200',       label: 'Médical' },
  FEEDING:    { emoji: '🌿', color: 'bg-green-100 text-green-700 border-green-200', label: 'Alimentation' },
  CLEANING:   { emoji: '🧹', color: 'bg-blue-100 text-blue-700 border-blue-200',    label: 'Nettoyage' },
  TRAINING:   { emoji: '📚', color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Formation' },
  INSPECTION: { emoji: '🔍', color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Inspection' },
  OTHER:      { emoji: '📌', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-border',    label: 'Autre' },
};

const PRIORITY_CONFIG = {
  LOW:    { label: 'Basse',    color: 'text-gray-500' },
  NORMAL: { label: 'Normale',  color: 'text-blue-600' },
  HIGH:   { label: 'Haute',    color: 'text-orange-600' },
  URGENT: { label: 'Urgente',  color: 'text-red-600' },
};

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
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
  const [view, setView] = useState<'month' | 'list'>('month');
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'OTHER' as AgendaEvent['type'],
    priority: 'NORMAL' as AgendaEvent['priority'],
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    recurrence: 'NONE',
    description: '',
  });

  const queryClient = useQueryClient();

  // Calcul des dates de début/fin du mois affiché
  const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate()}`;

  const { data: events = [], isLoading, isError, error } = useQuery<AgendaEvent[]>({
    queryKey: ['agenda-events', currentYear, currentMonth, filterType],
    queryFn: () => {
      const params = new URLSearchParams({ startDate: monthStart, endDate: monthEnd });
      if (filterType !== 'ALL') params.set('type', filterType);
      return api.get(`/agenda?${params}`).then(r => r.data);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      api.post('/agenda', {
        title: data.title,
        type: data.type,
        priority: data.priority,
        startDate: `${data.startDate}T${data.startTime}:00.000Z`,
        recurrence: data.recurrence,
        description: data.description || undefined,
      }),
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['agenda-events'] });
      setShowModal(false);
      setForm({ title: '', type: 'OTHER', priority: 'NORMAL', startDate: new Date().toISOString().split('T')[0], startTime: '09:00', recurrence: 'NONE', description: '' });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/agenda/${id}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agenda-events'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/agenda/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agenda-events'] }),
  });

  const calendarDays = getCalendarDays(currentYear, currentMonth);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.startDate.startsWith(dateStr));
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];
  const urgentEvents = events.filter(e => (e.priority === 'URGENT' || e.priority === 'HIGH') && e.status === 'PENDING');

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
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Planning des soins, visites et événements</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/v1/agenda/export/ical?startDate=${monthStart}&endDate=${monthEnd}`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:bg-muted/20 transition-colors flex items-center gap-2"
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
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['month', 'list'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === v ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              {v === 'month' ? 'Mois' : 'Liste'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterType === 'ALL' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-border hover:bg-gray-50'}`}
          >
            Tous {events.length > 0 && `(${events.length})`}
          </button>
          {Object.entries(TYPE_CONFIG).map(([type, config]) => {
            const count = events.filter(e => e.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterType === type ? config.color + ' border-current' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-border hover:bg-gray-50'}`}
              >
                {config.emoji} {config.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full" />
        </div>
      )}

      {!isLoading && view === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendrier mensuel */}
          <div className="lg:col-span-2 bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-semibold text-gray-900">{MONTHS[currentMonth]} {currentYear}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="p-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : [];
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
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs px-1.5 py-0.5 rounded truncate border ${TYPE_CONFIG[event.type]?.color || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                            >
                              {TYPE_CONFIG[event.type]?.emoji} {event.title.substring(0, 15)}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400 px-1">+{dayEvents.length - 2} autres</div>
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
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {selectedDay ? `${selectedDay} ${MONTHS[currentMonth]} ${currentYear}` : 'Sélectionner un jour'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedDayEvents.length} événement(s)</p>
            </div>
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">📅</div>
                  <p className="text-sm">Aucun événement ce jour</p>
                  <button onClick={() => setShowModal(true)} className="mt-3 text-xs text-forest-600 hover:text-forest-700 font-medium">
                    + Ajouter un événement
                  </button>
                </div>
              ) : (
                selectedDayEvents.map(event => (
                  <div key={event.id} className={`p-3 rounded-xl border ${TYPE_CONFIG[event.type]?.color || 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-border'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{TYPE_CONFIG[event.type]?.emoji}</span>
                        <div>
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs opacity-70">
                            🕐 {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${PRIORITY_CONFIG[event.priority]?.color || ''}`}>
                        {PRIORITY_CONFIG[event.priority]?.label}
                      </span>
                    </div>
                    <div className="mt-2 space-y-0.5 text-xs opacity-80">
                      {event.animal && <div>🦜 {event.animal.name}</div>}
                      {event.enclosure && <div>🏠 {event.enclosure.name} ({event.enclosure.code})</div>}
                      {event.assignedTo && <div>👤 {event.assignedTo.firstName} {event.assignedTo.lastName}</div>}
                      {event.recurrence && event.recurrence !== 'NONE' && (
                        <div>🔄 {event.recurrence === 'DAILY' ? 'Quotidien' : event.recurrence === 'WEEKLY' ? 'Hebdomadaire' : 'Mensuel'}</div>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      {event.status === 'PENDING' && (
                        <button
                          onClick={() => completeMutation.mutate(event.id)}
                          disabled={completeMutation.isPending}
                          className="text-xs px-2 py-1 bg-white/60 rounded hover:bg-white/80 transition-colors font-medium"
                        >
                          ✓ Compléter
                        </button>
                      )}
                      {event.status === 'COMPLETED' && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">✓ Complété</span>
                      )}
                      <button
                        onClick={() => { if (confirm('Supprimer cet événement ?')) deleteMutation.mutate(event.id); }}
                        className="text-xs px-2 py-1 bg-white/60 rounded hover:bg-red-50 text-red-600 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!isLoading && view === 'list' && (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Tous les événements — {MONTHS[currentMonth]} {currentYear}</h3>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📅</div>
              <p>Aucun événement ce mois-ci</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {[...events].sort((a, b) => a.startDate.localeCompare(b.startDate)).map(event => (
                <div key={event.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:bg-muted/20 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${TYPE_CONFIG[event.type]?.color || 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-border'}`}>
                    {TYPE_CONFIG[event.type]?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-foreground truncate">{event.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.startDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {' à '}
                      {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {event.animal && ` · 🦜 ${event.animal.name}`}
                      {event.assignedTo && ` · 👤 ${event.assignedTo.firstName}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${PRIORITY_CONFIG[event.priority]?.color || ''}`}>
                      {PRIORITY_CONFIG[event.priority]?.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${event.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : event.status === 'CANCELLED' ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>
                      {event.status === 'COMPLETED' ? 'Complété' : event.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Événements urgents */}
      {urgentEvents.length > 0 && (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-foreground mb-4">⚠️ Événements urgents à venir</h3>
          <div className="space-y-3">
            {urgentEvents.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{TYPE_CONFIG[event.type]?.emoji}</span>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{event.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.startDate).toLocaleDateString('fr-FR')}
                      {event.assignedTo && ` · ${event.assignedTo.firstName} ${event.assignedTo.lastName}`}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  event.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {PRIORITY_CONFIG[event.priority]?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal création événement */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Nouvel événement</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Titre de l'événement"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as AgendaEvent['type'] }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500"
                  >
                    {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                      <option key={type} value={type}>{config.emoji} {config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorité</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as AgendaEvent['priority'] }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([p, config]) => (
                      <option key={p} value={p}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heure</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Récurrence</label>
                <select
                  value={form.recurrence}
                  onChange={e => setForm(f => ({ ...f, recurrence: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500"
                >
                  <option value="NONE">Aucune</option>
                  <option value="DAILY">Quotidienne</option>
                  <option value="WEEKLY">Hebdomadaire</option>
                  <option value="MONTHLY">Mensuelle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description optionnelle..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:bg-gray-900">
                Annuler
              </button>
              <button
                onClick={() => { if (form.title && form.startDate) createMutation.mutate(form); }}
                disabled={!form.title || !form.startDate || createMutation.isPending}
                className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : '+ Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
