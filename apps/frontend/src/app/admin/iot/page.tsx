'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Sensor {
  id: string;
  type: string;
  enclosure: string;
  value: number;
  unit: string;
  status: 'normal' | 'alert' | 'warning' | 'offline';
  lastUpdate?: string;
}

const statusConfig = {
  normal: { label: 'Normal', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700', dot: 'bg-green-500' },
  alert: { label: 'Alerte', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700', dot: 'bg-red-500' },
  warning: { label: 'Avertissement', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700', dot: 'bg-yellow-500' },
  offline: { label: 'Hors ligne', color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700', dot: 'bg-slate-500' },
};

const typeIcons: Record<string, string> = {
  temperature: '️',
  humidity: '',
  co2: '',
  light: '',
  motion: '',
  weight: '️',
  ph: '',
  oxygen: '',
};

export default function IotPage() {
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  const { data: sensors = [], isLoading, isError, refetch } = useQuery<Sensor[]>({
    queryKey: ['iot-sensors'],
    queryFn: async () => {
      const res = await api.get('/iot/sensors');
      return res.data;
    },
    refetchInterval: 15000,
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['iot-history', selectedSensor],
    queryFn: async () => {
      const res = await api.get(`/iot/sensor/${selectedSensor}/history`);
      return res.data;
    },
    enabled: !!selectedSensor,
  });

  const alertSensors = sensors.filter((s) => s.status === 'alert');
  const warningSensors = sensors.filter((s) => s.status === 'warning');
  const normalSensors = sensors.filter((s) => s.status === 'normal');
  const offlineSensors = sensors.filter((s) => s.status === 'offline');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">IoT & Capteurs</h1>
          <p className="text-slate-400 mt-1">Surveillance en temps réel — actualisation toutes les 15s</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
        >
          ↻ Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total capteurs', value: sensors.length, color: 'text-slate-300' },
          { label: 'En alerte', value: alertSensors.length, color: 'text-red-400' },
          { label: 'Avertissements', value: warningSensors.length, color: 'text-yellow-400' },
          { label: 'Normaux', value: normalSensors.length, color: 'text-green-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">{kpi.label}</p>
            <p className={`text-3xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : isError ? (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 text-center text-red-400">
          Erreur lors du chargement des capteurs
        </div>
      ) : sensors.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3"></p>
          <p className="text-slate-300 font-semibold">Aucun capteur connecté</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor) => {
            const cfg = statusConfig[sensor.status] || statusConfig.offline;
            const icon = typeIcons[sensor.type] || '';
            return (
              <div
                key={sensor.id}
                onClick={() => setSelectedSensor(selectedSensor === sensor.id ? null : sensor.id)}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${cfg.bg} ${cfg.border} ${selectedSensor === sensor.id ? 'ring-2 ring-indigo-500' : 'hover:opacity-90'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <span className="text-white font-semibold capitalize">{sensor.type}</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{sensor.enclosure}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} ${sensor.status === 'alert' ? 'animate-pulse' : ''}`} />
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className={`text-3xl font-bold ${cfg.color}`}>
                    {sensor.value}
                    <span className="text-lg font-normal text-slate-400 ml-1">{sensor.unit}</span>
                  </p>
                  <p className="text-slate-500 text-xs mt-1">ID: {sensor.id}</p>
                </div>

                {/* Historique si sélectionné */}
                {selectedSensor === sensor.id && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    {loadingHistory ? (
                      <p className="text-slate-500 text-xs text-center">Chargement historique...</p>
                    ) : Array.isArray(history) && history.length > 0 ? (
                      <div>
                        <p className="text-slate-400 text-xs mb-2">Historique récent</p>
                        <div className="space-y-1">
                          {(history as Array<{ value: number; timestamp: string }>).slice(0, 5).map((h, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-slate-500">{new Date(h.timestamp).toLocaleTimeString('fr-FR')}</span>
                              <span className="text-slate-300">{h.value} {sensor.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs text-center">Aucun historique disponible</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
