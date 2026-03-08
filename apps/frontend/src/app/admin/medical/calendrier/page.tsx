// @ts-nocheck
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Calendar, Stethoscope,
  Syringe, Bird, AlertCircle, Clock, Plus,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface CalendarEvent {
  id: string;
  date: string;
  type: 'visit' | 'vaccination' | 'treatment' | 'brood';
  label: string;
  animalName?: string;
  animalId?: string;
  severity?: 'normal' | 'urgent' | 'info';
}

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const EVENT_COLORS: Record<string, string> = {
  visit: 'bg-forest-100 text-forest-700 border-forest-300',
  vaccination: 'bg-blue-100 text-blue-700 border-blue-300',
  treatment: 'bg-orange-100 text-orange-700 border-orange-300',
  brood: 'bg-amber-100 text-amber-700 border-amber-300',
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  visit: <Stethoscope className="w-3 h-3" />,
  vaccination: <Syringe className="w-3 h-3" />,
  treatment: <Clock className="w-3 h-3" />,
  brood: <Bird className="w-3 h-3" />,
};

export default function CalendrierPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Charger les événements du mois
  const dateFrom = new Date(year, month, 1).toISOString().split('T')[0];
  const dateTo = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data: visits = [] , isError } = useQuery({
    queryKey: ['calendar-visits', dateFrom, dateTo],
    queryFn: () => api.get(`/medical/visits?dateFrom=${dateFrom}&dateTo=${dateTo}`).then(r => r.data),
  });

  const { data: upcomingVisits = [] } = useQuery({
    queryKey: ['calendar-upcoming', dateFrom, dateTo],
    queryFn: () => api.get(`/medical/visits?dateFrom=${dateFrom}&dateTo=${dateTo}`).then(r =>
      (r.data as any[]).filter((v: any) => v.nextVisitDate)
    ),
  });

  // Construire les événements du calendrier
  const events: CalendarEvent[] = [
    ...(visits as any[]).map((v: any) => ({
      id: `visit-${v.id}`,
      date: v.visitDate.split('T')[0],
      type: 'visit' as const,
      label: `Visite ${v.type?.toLowerCase() || ''}`,
      animalName: v.animal?.name,
      animalId: v.animal?.id,
      severity: (v.type === 'EMERGENCY' ? 'urgent' : 'normal') as 'urgent' | 'normal' | 'info',
    })),
    ...(upcomingVisits as any[]).map((v: any) => ({
      id: `upcoming-${v.id}`,
      date: v.nextVisitDate?.split('T')[0],
      type: 'visit' as const,
      label: 'Suivi prévu',
      animalName: v.animal?.name,
      animalId: v.animal?.id,
      severity: 'info',
    })).filter((e: any) => e.date),
  ];

  // Calcul des jours du calendrier
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Lundi = 0

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Calendrier des soins</h1>
          <p className="text-muted-foreground text-sm mt-1">Planification des visites et traitements</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Planifier une visite
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier principal */}
        <div className="lg:col-span-2 card p-6">
          {/* Navigation mois */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-display font-bold text-foreground">
              {MONTHS_FR[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* En-têtes jours */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_FR.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1">
            {/* Cases vides avant le 1er */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-lg" />
            ))}

            {/* Jours du mois */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDay === day;
              const isTodayDay = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-16 rounded-lg p-1.5 text-left transition-all border ${
                    isSelected
                      ? 'bg-forest-600 text-white border-forest-600'
                      : isTodayDay
                      ? 'bg-forest-50 border-forest-300 text-forest-700'
                      : 'border-transparent hover:bg-muted text-foreground'
                  }`}
                >
                  <span className={`text-xs font-bold block mb-1 ${isSelected ? 'text-white' : isTodayDay ? 'text-forest-700' : 'text-foreground'}`}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className={`text-[10px] rounded px-1 truncate border ${
                          isSelected ? 'bg-forest-500 text-white border-forest-400' : EVENT_COLORS[ev.type]
                        }`}
                      >
                        {ev.animalName || ev.label}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className={`text-[10px] font-medium ${isSelected ? 'text-forest-200' : 'text-muted-foreground'}`}>
                        +{dayEvents.length - 2} autres
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Légende */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
            {Object.entries(EVENT_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={`w-3 h-3 rounded border ${color}`} />
                <span className="capitalize">{type === 'visit' ? 'Visite' : type === 'vaccination' ? 'Vaccination' : type === 'treatment' ? 'Traitement' : 'Couvée'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panneau latéral — événements du jour sélectionné */}
        <div className="space-y-4">
          {selectedDay && (
            <div className="card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-600" />
                {selectedDay} {MONTHS_FR[month]} {year}
              </h3>

              {selectedEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucun événement ce jour</p>
                  <button className="btn-secondary text-xs mt-3">
                    <Plus className="w-3 h-3 mr-1" />
                    Planifier
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map(ev => (
                    <div key={ev.id} className={`p-3 rounded-xl border ${EVENT_COLORS[ev.type]}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {EVENT_ICONS[ev.type]}
                        <span className="text-sm font-medium">{ev.label}</span>
                        {ev.severity === 'urgent' && (
                          <AlertCircle className="w-3 h-3 text-red-500 ml-auto" />
                        )}
                      </div>
                      {ev.animalName && (
                        <Link
                          href={`/admin/animaux/${ev.animalId}`}
                          className="text-xs underline underline-offset-2 hover:opacity-70 transition-opacity"
                        >
                          {ev.animalName}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prochains événements */}
          <div className="card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              À venir ce mois
            </h3>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Aucun événement planifié</p>
            ) : (
              <div className="space-y-2">
                {events
                  .filter(e => {
                    const d = new Date(e.date);
                    return d >= today;
                  })
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 8)
                  .map(ev => (
                    <div key={ev.id} className="flex items-center gap-3 text-sm">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${EVENT_COLORS[ev.type]}`}>
                        {EVENT_ICONS[ev.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{ev.animalName || ev.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ev.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
