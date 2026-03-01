'use client';
import { useState } from 'react';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7h à 20h

const EVENTS = [
  { id: 'e1', titre: 'Soins Volière A', heure: 8, duree: 1, jour: 1, type: 'soins', couleur: 'bg-green-100 border-green-400 text-green-800', employe: 'Marie Dupont' },
  { id: 'e2', titre: 'Visite vétérinaire — Amazona', heure: 9, duree: 1.5, jour: 1, type: 'medical', couleur: 'bg-blue-100 border-blue-400 text-blue-800', employe: 'Dr. Rousseau' },
  { id: 'e3', titre: 'Alimentation reptiles', heure: 10, duree: 1, jour: 2, type: 'soins', couleur: 'bg-green-100 border-green-400 text-green-800', employe: 'Sophie Bernard' },
  { id: 'e4', titre: 'Vaccination — Lot A', heure: 14, duree: 2, jour: 2, type: 'medical', couleur: 'bg-blue-100 border-blue-400 text-blue-800', employe: 'Dr. Rousseau' },
  { id: 'e5', titre: 'Nettoyage enclos reptiles', heure: 8, duree: 2, jour: 3, type: 'entretien', couleur: 'bg-orange-100 border-orange-400 text-orange-800', employe: 'Jean Martin' },
  { id: 'e6', titre: 'Pesée mensuelle — Oiseaux', heure: 11, duree: 2, jour: 3, type: 'medical', couleur: 'bg-blue-100 border-blue-400 text-blue-800', employe: 'Marie Dupont' },
  { id: 'e7', titre: 'Formation premiers secours', heure: 9, duree: 7, jour: 4, type: 'formation', couleur: 'bg-purple-100 border-purple-400 text-purple-800', employe: 'Sophie Bernard' },
  { id: 'e8', titre: 'Contrôle couvées', heure: 8, duree: 1, jour: 5, type: 'soins', couleur: 'bg-green-100 border-green-400 text-green-800', employe: 'Marie Dupont' },
  { id: 'e9', titre: 'Inventaire stock', heure: 14, duree: 2, jour: 5, type: 'admin', couleur: 'bg-gray-100 border-gray-400 text-gray-800', employe: 'Jean Martin' },
  { id: 'e10', titre: 'Soins weekend — Toutes zones', heure: 8, duree: 3, jour: 6, type: 'soins', couleur: 'bg-green-100 border-green-400 text-green-800', employe: 'Marie Dupont' },
  { id: 'e11', titre: 'Urgence médicale — Dendro', heure: 15, duree: 1, jour: 6, type: 'urgence', couleur: 'bg-red-100 border-red-400 text-red-800', employe: 'Dr. Rousseau' },
];

const DAYS = [
  { label: 'Lun', date: '03/03' },
  { label: 'Mar', date: '04/03' },
  { label: 'Mer', date: '05/03' },
  { label: 'Jeu', date: '06/03' },
  { label: 'Ven', date: '07/03' },
  { label: 'Sam', date: '08/03' },
  { label: 'Dim', date: '09/03' },
];

const TYPE_LABELS: Record<string, string> = {
  soins: '🌿 Soins',
  medical: '🩺 Médical',
  entretien: '🔧 Entretien',
  formation: '🎓 Formation',
  admin: '📋 Admin',
  urgence: '🚨 Urgence',
};

export default function AgendaSemainePage() {
  const [selectedEvent, setSelectedEvent] = useState<typeof EVENTS[0] | null>(null);
  const [filterType, setFilterType] = useState('');

  const CELL_HEIGHT = 60; // px par heure

  const filteredEvents = filterType ? EVENTS.filter(e => e.type === filterType) : EVENTS;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda — Vue semaine</h1>
          <p className="text-sm text-gray-500 mt-1">Semaine du 3 au 9 mars 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <a href="/admin/agenda" className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700">Mois</a>
            <span className="px-3 py-1.5 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm">Semaine</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors text-sm font-medium">
            + Événement
          </button>
        </div>
      </div>

      {/* Filtres par type */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterType('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!filterType ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Tous
        </button>
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <button
            key={type}
            onClick={() => setFilterType(type === filterType ? '' : type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterType === type ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Calendrier semaine */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* En-têtes */}
        <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          <div className="p-3 bg-gray-50 border-r border-gray-100" />
          {DAYS.map((day, i) => (
            <div
              key={day.label}
              className={`p-3 text-center border-r border-gray-100 last:border-r-0 ${i >= 5 ? 'bg-purple-50' : 'bg-gray-50'}`}
            >
              <div className="text-xs font-medium text-gray-500">{day.label}</div>
              <div className={`text-sm font-bold mt-0.5 ${i >= 5 ? 'text-purple-700' : 'text-gray-900'}`}>{day.date}</div>
            </div>
          ))}
        </div>

        {/* Grille horaire */}
        <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
          <div className="relative" style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)' }}>
            {/* Colonne heures */}
            <div className="border-r border-gray-100">
              {HOURS.map(h => (
                <div key={h} className="border-b border-gray-50 flex items-start justify-end pr-2 pt-1" style={{ height: `${CELL_HEIGHT}px` }}>
                  <span className="text-xs text-gray-400">{h}:00</span>
                </div>
              ))}
            </div>

            {/* Colonnes jours */}
            {DAYS.map((day, dayIdx) => (
              <div key={day.label} className={`relative border-r border-gray-100 last:border-r-0 ${dayIdx >= 5 ? 'bg-purple-50/20' : ''}`}>
                {/* Lignes horaires */}
                {HOURS.map(h => (
                  <div key={h} className="border-b border-gray-50" style={{ height: `${CELL_HEIGHT}px` }} />
                ))}

                {/* Événements */}
                {filteredEvents
                  .filter(e => e.jour === dayIdx + 1)
                  .map(event => {
                    const top = (event.heure - 7) * CELL_HEIGHT;
                    const height = event.duree * CELL_HEIGHT - 4;
                    return (
                      <div
                        key={event.id}
                        className={`absolute left-1 right-1 rounded-lg border-l-4 p-2 cursor-pointer hover:shadow-md transition-shadow overflow-hidden ${event.couleur}`}
                        style={{ top: `${top + 2}px`, height: `${height}px` }}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="text-xs font-semibold leading-tight truncate">{event.titre}</div>
                        {height > 40 && (
                          <div className="text-xs opacity-70 mt-0.5 truncate">{event.employe}</div>
                        )}
                        {height > 60 && (
                          <div className="text-xs opacity-60 mt-0.5">{event.heure}:00 – {event.heure + event.duree}:00</div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau détail événement */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedEvent.titre}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{TYPE_LABELS[selectedEvent.type]}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Date', value: DAYS[selectedEvent.jour - 1].date + '/2026' },
                { label: 'Horaire', value: `${selectedEvent.heure}:00 – ${selectedEvent.heure + selectedEvent.duree}:00 (${selectedEvent.duree}h)` },
                { label: 'Responsable', value: selectedEvent.employe },
                { label: 'Type', value: TYPE_LABELS[selectedEvent.type] },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelectedEvent(null)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                Fermer
              </button>
              <button className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700">
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
