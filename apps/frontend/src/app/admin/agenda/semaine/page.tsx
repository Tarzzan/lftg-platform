'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7h à 20h

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  MEDICAL:    { label: 'Médical',      color: 'bg-blue-100 border-blue-400 text-blue-800' },
  FEEDING:    { label: 'Alimentation', color: 'bg-green-100 border-green-400 text-green-800' },
  CLEANING:   { label: 'Nettoyage',    color: 'bg-orange-100 border-orange-400 text-orange-800' },
  TRAINING:   { label: 'Formation',    color: 'bg-purple-100 border-purple-400 text-purple-800' },
  INSPECTION: { label: 'Inspection',   color: 'bg-amber-100 border-amber-400 text-amber-800' },
  OTHER:      { label: 'Autre',        color: 'bg-gray-100 border-gray-400 text-gray-800' },
};

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function getWeekDays(date: Date) {
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function AgendaSemainePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const queryClient = useQueryClient();

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(baseDate);

  const startDate = weekDays[0].toISOString().split('T')[0];
  const endDate = weekDays[6].toISOString().split('T')[0];

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['agenda-week', startDate, endDate],
    queryFn: () => api.get(`/agenda?startDate=${startDate}&endDate=${endDate}`).then(r => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/agenda/${id}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agenda-week'] }),
  });

  const getEventsForDayAndHour = (dayIndex: number, hour: number) => {
    const dayStr = weekDays[dayIndex].toISOString().split('T')[0];
    return (events as any[]).filter(e => {
      const eDate = new Date(e.startDate);
      return eDate.toISOString().split('T')[0] === dayStr && eDate.getHours() === hour;
    });
  };

  const formatWeekRange = () => {
    const start = weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const end = weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} — ${end}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📅 Vue semaine</h1>
          <p className="text-gray-500 text-sm mt-1">{formatWeekRange()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            ← Semaine précédente
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Semaine suivante →
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
          {/* En-têtes des jours */}
          <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
            <div className="p-2 text-xs text-gray-400 border-r border-gray-100" />
            {weekDays.map((day, i) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const dayEvents = (events as any[]).filter(e => new Date(e.startDate).toISOString().split('T')[0] === day.toISOString().split('T')[0]);
              return (
                <div key={i} className={`p-2 text-center border-r border-gray-100 ${isToday ? 'bg-forest-50' : ''}`}>
                  <div className={`text-xs font-semibold uppercase tracking-wide ${isToday ? 'text-forest-700' : 'text-gray-500'}`}>
                    {DAYS_FR[i]}
                  </div>
                  <div className={`text-lg font-bold mt-0.5 ${isToday ? 'text-forest-700' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="text-xs text-gray-400">{dayEvents.length} evt</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grille horaire */}
          <div className="overflow-y-auto max-h-[600px]">
            {HOURS.map(hour => (
              <div key={hour} className="grid border-b border-gray-100" style={{ gridTemplateColumns: '60px repeat(7, 1fr)', minHeight: '60px' }}>
                <div className="p-2 text-xs text-gray-400 border-r border-gray-100 text-right pr-3 pt-2">
                  {hour}:00
                </div>
                {weekDays.map((day, dayIndex) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  const hourEvents = getEventsForDayAndHour(dayIndex, hour);
                  return (
                    <div key={dayIndex} className={`border-r border-gray-100 p-1 relative ${isToday ? 'bg-forest-50/30' : ''}`}>
                      {hourEvents.map(event => (
                        <div
                          key={event.id}
                          className={`text-xs rounded border px-1.5 py-1 mb-0.5 cursor-pointer hover:opacity-80 transition-opacity ${
                            TYPE_CONFIG[event.type]?.color || 'bg-gray-100 border-gray-300 text-gray-700'
                          } ${event.status === 'COMPLETED' ? 'opacity-60 line-through' : ''}`}
                          title={`${event.title}${event.assignedTo ? ` — ${event.assignedTo.firstName} ${event.assignedTo.lastName}` : ''}`}
                          onClick={() => {
                            if (event.status === 'PENDING' && confirm(`Marquer "${event.title}" comme complété ?`)) {
                              completeMutation.mutate(event.id);
                            }
                          }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          {event.assignedTo && (
                            <div className="opacity-70 truncate">{event.assignedTo.firstName}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Légende */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(TYPE_CONFIG).map(([type, config]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className={`w-3 h-3 rounded border ${config.color}`} />
            {config.label}
          </div>
        ))}
      </div>
    </div>
  );
}
