'use client';

import { useState } from 'react';

const WEATHER_DATA = {
  current: { temp: 29, feelsLike: 34, humidity: 78, wind: 18, uv: 8, pressure: 1012, visibility: 10, desc: 'Partiellement nuageux', icon: '⛅' },
  forecast: [
    { day: 'Lun', date: '02 Mar', icon: '🌤️', high: 31, low: 24, rain: 20, humidity: 72 },
    { day: 'Mar', date: '03 Mar', icon: '⛈️', high: 28, low: 23, rain: 85, humidity: 88 },
    { day: 'Mer', date: '04 Mar', icon: '🌧️', high: 26, low: 22, rain: 70, humidity: 90 },
    { day: 'Jeu', date: '05 Mar', icon: '⛅', high: 30, low: 24, rain: 30, humidity: 75 },
    { day: 'Ven', date: '06 Mar', icon: '☀️', high: 32, low: 25, rain: 10, humidity: 68 },
    { day: 'Sam', date: '07 Mar', icon: '🌤️', high: 31, low: 24, rain: 25, humidity: 71 },
    { day: 'Dim', date: '08 Mar', icon: '⛅', high: 30, low: 23, rain: 40, humidity: 76 },
  ],
  hourly: [
    { time: '08h', temp: 27, icon: '🌤️', rain: 5 },
    { time: '10h', temp: 29, icon: '⛅', rain: 10 },
    { time: '12h', temp: 31, icon: '☀️', rain: 5 },
    { time: '14h', temp: 32, icon: '☀️', rain: 0 },
    { time: '16h', temp: 30, icon: '⛅', rain: 20 },
    { time: '18h', temp: 28, icon: '🌦️', rain: 45 },
    { time: '20h', temp: 26, icon: '🌧️', rain: 60 },
    { time: '22h', temp: 25, icon: '⛅', rain: 30 },
  ],
  alerts: [
    { type: 'Vigilance Orange', desc: 'Risque d\'orages violents mardi 03 mars', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  ],
  stations: [
    { name: 'Enclos Perroquets', temp: 28, humidity: 75, status: 'normal' },
    { name: 'Terrarium Reptiles', temp: 30, humidity: 65, status: 'normal' },
    { name: 'Vivarium Dendrobates', temp: 26, humidity: 90, status: 'optimal' },
    { name: 'Bassin Caïmans', temp: 29, humidity: 82, status: 'normal' },
    { name: 'Serre Tropicale', temp: 32, humidity: 88, status: 'attention' },
  ],
};

export default function MeteoPage() {
  const [view, setView] = useState<'dashboard' | 'forecast' | 'stations'>('dashboard');

  const statusColors: Record<string, string> = {
    normal: 'bg-green-100 text-green-700',
    optimal: 'bg-blue-100 text-blue-700',
    attention: 'bg-orange-100 text-orange-700',
    critique: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl">🌤️</span> Météo Guyane
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Conditions météorologiques en temps réel — Cayenne, Guyane française</p>
        </div>
        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
          <div>Dernière mise à jour</div>
          <div className="font-medium text-gray-700 dark:text-gray-300">01 Mar 2026 · 14h32</div>
        </div>
      </div>

      {/* Alertes météo */}
      {WEATHER_DATA.alerts.map((alert, i) => (
        <div key={i} className={`border rounded-xl p-4 flex items-center gap-3 ${alert.color}`}>
          <span className="text-xl">⚠️</span>
          <div>
            <span className="font-bold">{alert.type}</span>
            <span className="ml-2 text-sm">{alert.desc}</span>
          </div>
        </div>
      ))}

      {/* Météo actuelle */}
      <div className="bg-gradient-to-br from-maroni-600 to-maroni-800 rounded-2xl p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <span className="text-8xl">{WEATHER_DATA.current.icon}</span>
            <div>
              <div className="text-6xl font-bold">{WEATHER_DATA.current.temp}°C</div>
              <div className="text-maroni-200 mt-1">{WEATHER_DATA.current.desc}</div>
              <div className="text-maroni-300 text-sm">Ressenti {WEATHER_DATA.current.feelsLike}°C</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '💧', label: 'Humidité', value: `${WEATHER_DATA.current.humidity}%` },
              { icon: '💨', label: 'Vent', value: `${WEATHER_DATA.current.wind} km/h NE` },
              { icon: '☀️', label: 'Indice UV', value: `${WEATHER_DATA.current.uv}/11` },
              { icon: '🔵', label: 'Pression', value: `${WEATHER_DATA.current.pressure} hPa` },
              { icon: '👁️', label: 'Visibilité', value: `${WEATHER_DATA.current.visibility} km` },
              { icon: '🌅', label: 'Lever/Coucher', value: '06:12 / 18:24' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 text-maroni-200 text-xs mb-1">
                  <span>{item.icon}</span><span>{item.label}</span>
                </div>
                <div className="font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {(['dashboard', 'forecast', 'stations'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'dashboard' ? '⏱️ Horaire' : tab === 'forecast' ? '📅 7 jours' : '🌡️ Stations'}
          </button>
        ))}
      </div>

      {/* Vue horaire */}
      {view === 'dashboard' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Prévisions horaires — Aujourd'hui</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {WEATHER_DATA.hourly.map(h => (
              <div key={h.time} className="flex-shrink-0 text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 min-w-[80px]">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{h.time}</div>
                <div className="text-2xl mb-2">{h.icon}</div>
                <div className="font-bold text-gray-900 dark:text-white">{h.temp}°</div>
                <div className="text-xs text-blue-500 mt-1">💧 {h.rain}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue 7 jours */}
      {view === 'forecast' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Prévisions 7 jours</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {WEATHER_DATA.forecast.map(day => (
              <div key={day.day} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <div className="w-20">
                  <div className="font-semibold text-gray-900 dark:text-white">{day.day}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{day.date}</div>
                </div>
                <span className="text-3xl">{day.icon}</span>
                <div className="flex items-center gap-2 text-sm text-blue-500">
                  <span>💧</span><span>{day.rain}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <span>💦</span><span>{day.humidity}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 dark:text-white">{day.high}°</span>
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                      style={{ width: `${((day.high - 20) / 15) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stations internes */}
      {view === 'stations' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WEATHER_DATA.stations.map(station => (
              <div key={station.name} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{station.name}</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[station.status]}`}>
                    {station.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{station.temp}°C</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Température</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{station.humidity}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Humidité</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
            💡 Les capteurs IoT sont mis à jour toutes les 5 minutes. Les alertes sont envoyées automatiquement si les seuils sont dépassés.
          </div>
        </div>
      )}
    </div>
  );
}
