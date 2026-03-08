'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface MeteoCurrentData {
  temperature?: number;
  humidity?: number;
  pressure?: number;
  windSpeed?: number;
  windDirection?: string;
  description?: string;
  icon?: string;
  city?: string;
  feelsLike?: number;
  uvIndex?: number;
  visibility?: number;
}

interface MeteoForecastDay {
  date: string;
  tempMin?: number;
  tempMax?: number;
  humidity?: number;
  description?: string;
  icon?: string;
  precipitation?: number;
}

interface MeteoForecast {
  days?: MeteoForecastDay[];
}

const weatherIcons: Record<string, string> = {
  clear: '☀️',
  sunny: '☀️',
  cloudy: '☁️',
  overcast: '🌥️',
  rain: '🌧️',
  drizzle: '🌦️',
  storm: '⛈️',
  snow: '❄️',
  fog: '🌫️',
  wind: '💨',
};

const getWeatherIcon = (desc?: string, icon?: string): string => {
  if (icon) return icon;
  if (!desc) return '🌤️';
  const lower = desc.toLowerCase();
  for (const [key, emoji] of Object.entries(weatherIcons)) {
    if (lower.includes(key)) return emoji;
  }
  return '🌤️';
};

export default function MeteoPage() {
  const { data: current, isLoading: loadingCurrent } = useQuery<MeteoCurrentData>({
    queryKey: ['meteo-current'],
    queryFn: async () => {
      const res = await api.get('/meteo/current');
      return res.data;
    },
    refetchInterval: 300000, // 5 min
  });

  const { data: forecast, isLoading: loadingForecast } = useQuery<MeteoForecast>({
    queryKey: ['meteo-forecast'],
    queryFn: async () => {
      const res = await api.get('/meteo/forecast');
      return res.data;
    },
    refetchInterval: 3600000, // 1h
  });

  const isLoading = loadingCurrent || loadingForecast;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Météo</h1>
        <p className="text-slate-400 mt-1">Conditions météorologiques pour la gestion des animaux</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <>
          {/* Météo actuelle */}
          {current && (
            <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-xl p-6 border border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{current.city || 'Localisation'}</p>
                  <div className="flex items-end gap-3 mt-1">
                    <span className="text-6xl font-bold text-white">{current.temperature !== undefined ? `${current.temperature}°C` : '—'}</span>
                    <span className="text-4xl">{getWeatherIcon(current.description, current.icon)}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{current.description || '—'}</p>
                  {current.feelsLike !== undefined && (
                    <p className="text-slate-400 text-sm">Ressenti : {current.feelsLike}°C</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-right">
                  {current.humidity !== undefined && (
                    <div>
                      <p className="text-slate-400 text-xs">Humidité</p>
                      <p className="text-white font-semibold">{current.humidity}%</p>
                    </div>
                  )}
                  {current.windSpeed !== undefined && (
                    <div>
                      <p className="text-slate-400 text-xs">Vent</p>
                      <p className="text-white font-semibold">{current.windSpeed} km/h</p>
                    </div>
                  )}
                  {current.pressure !== undefined && (
                    <div>
                      <p className="text-slate-400 text-xs">Pression</p>
                      <p className="text-white font-semibold">{current.pressure} hPa</p>
                    </div>
                  )}
                  {current.uvIndex !== undefined && (
                    <div>
                      <p className="text-slate-400 text-xs">UV</p>
                      <p className={`font-semibold ${current.uvIndex >= 8 ? 'text-red-400' : current.uvIndex >= 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {current.uvIndex}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recommandations pour les animaux */}
          {current && (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-white font-semibold mb-3">🦜 Recommandations pour les animaux</h2>
              <div className="space-y-2">
                {(current.temperature || 0) > 30 && (
                  <div className="flex items-center gap-2 text-red-400">
                    <span>🌡️</span>
                    <span className="text-sm">Chaleur excessive — Vérifier l'hydratation et l'ombrage des enclos</span>
                  </div>
                )}
                {(current.temperature || 0) < 5 && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <span>❄️</span>
                    <span className="text-sm">Froid — Vérifier le chauffage des enclos tropicaux</span>
                  </div>
                )}
                {(current.humidity || 0) > 85 && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span>💧</span>
                    <span className="text-sm">Humidité élevée — Surveiller les reptiles et amphibiens</span>
                  </div>
                )}
                {(current.windSpeed || 0) > 50 && (
                  <div className="flex items-center gap-2 text-orange-400">
                    <span>💨</span>
                    <span className="text-sm">Vent fort — Sécuriser les volières extérieures</span>
                  </div>
                )}
                {(current.temperature || 20) >= 15 && (current.temperature || 20) <= 25 && (current.humidity || 50) < 70 && (
                  <div className="flex items-center gap-2 text-green-400">
                    <span>✅</span>
                    <span className="text-sm">Conditions idéales pour les activités extérieures</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prévisions 7 jours */}
          {forecast?.days && forecast.days.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-white font-semibold mb-4">📅 Prévisions 7 jours</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {forecast.days.map((day) => (
                  <div key={day.date} className="bg-slate-700 rounded-lg p-3 text-center">
                    <p className="text-slate-400 text-xs">
                      {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-2xl my-2">{getWeatherIcon(day.description, day.icon)}</p>
                    <p className="text-white font-semibold text-sm">{day.tempMax !== undefined ? `${day.tempMax}°` : '—'}</p>
                    <p className="text-slate-400 text-xs">{day.tempMin !== undefined ? `${day.tempMin}°` : '—'}</p>
                    {day.precipitation !== undefined && day.precipitation > 0 && (
                      <p className="text-blue-400 text-xs mt-1">💧 {day.precipitation}mm</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
