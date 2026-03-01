import { Injectable, Logger } from '@nestjs/common';

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: string;
  description: string;
  icon: string;
  uvIndex: number;
  visibility: number;
  sunrise: string;
  sunset: string;
  alerts: WeatherAlert[];
  forecast: DayForecast[];
  animalImpact: AnimalImpact[];
}

export interface WeatherAlert {
  type: 'cyclone' | 'canicule' | 'pluie_intense' | 'orage' | 'vent_fort' | 'vigilance';
  severity: 'info' | 'warning' | 'danger' | 'critical';
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface DayForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  humidity: number;
  precipitation: number;
  description: string;
  icon: string;
}

export interface AnimalImpact {
  species: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  affectedCount: number;
}

@Injectable()
export class MeteoService {
  private readonly logger = new Logger(MeteoService.name);
  private readonly apiKey = process.env.OPENWEATHER_API_KEY || 'demo_key';

  // Coordonnées de la Ferme Tropicale de Guyane (Cayenne)
  private readonly lat = 4.9224;
  private readonly lon = -52.3135;

  /**
   * Récupérer la météo actuelle de Cayenne, Guyane
   * En production : appel à l'API OpenWeatherMap
   */
  async getCurrentWeather(): Promise<WeatherData> {
    this.logger.log('Récupération météo Cayenne, Guyane');

    // Données simulées réalistes pour la Guyane (climat équatorial)
    const hour = new Date().getHours();
    const isAfternoon = hour >= 14 && hour <= 17;
    const isMorning = hour >= 6 && hour <= 10;

    const baseTemp = 28 + (isAfternoon ? 4 : isMorning ? -2 : 0);
    const humidity = 75 + Math.floor(Math.random() * 15);

    return {
      location: 'Cayenne, Guyane française',
      temperature: baseTemp + Math.floor(Math.random() * 3),
      feelsLike: baseTemp + 3 + Math.floor(Math.random() * 2),
      humidity,
      pressure: 1010 + Math.floor(Math.random() * 8),
      windSpeed: 15 + Math.floor(Math.random() * 20),
      windDirection: ['NE', 'E', 'SE', 'N'][Math.floor(Math.random() * 4)],
      description: humidity > 85 ? 'Averses tropicales' : 'Partiellement nuageux',
      icon: humidity > 85 ? '🌧️' : '⛅',
      uvIndex: isAfternoon ? 11 : isMorning ? 6 : 8,
      visibility: 8 + Math.floor(Math.random() * 4),
      sunrise: '06:12',
      sunset: '18:24',
      alerts: this.generateAlerts(),
      forecast: this.generateForecast(),
      animalImpact: this.assessAnimalImpact(baseTemp, humidity),
    };
  }

  /**
   * Récupérer les prévisions sur 7 jours
   */
  async getForecast(days = 7): Promise<DayForecast[]> {
    return this.generateForecast(days);
  }

  /**
   * Récupérer les alertes météo actives
   */
  async getAlerts(): Promise<WeatherAlert[]> {
    return this.generateAlerts();
  }

  /**
   * Évaluer l'impact météo sur les animaux
   */
  async getAnimalImpact(): Promise<AnimalImpact[]> {
    const weather = await this.getCurrentWeather();
    return this.assessAnimalImpact(weather.temperature, weather.humidity);
  }

  /**
   * Récupérer l'historique météo (30 jours)
   */
  async getHistory(days = 30) {
    const now = new Date();
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(now.getTime() - (days - 1 - i) * 86400000);
      return {
        date: date.toISOString().split('T')[0],
        tempMin: 22 + Math.floor(Math.random() * 4),
        tempMax: 30 + Math.floor(Math.random() * 6),
        humidity: 70 + Math.floor(Math.random() * 20),
        precipitation: Math.random() > 0.4 ? Math.floor(Math.random() * 30) : 0,
        description: Math.random() > 0.5 ? 'Averses' : 'Ensoleillé',
      };
    });
  }

  private generateAlerts(): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const rand = Math.random();

    if (rand > 0.7) {
      alerts.push({
        type: 'pluie_intense',
        severity: 'warning',
        title: 'Vigilance pluie intense',
        description: 'Précipitations importantes attendues cet après-midi. Vérifier les enclos extérieurs.',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 6 * 3600000).toISOString(),
      });
    }

    if (rand > 0.9) {
      alerts.push({
        type: 'canicule',
        severity: 'danger',
        title: 'Alerte canicule',
        description: 'Températures exceptionnelles >36°C. Hydratation renforcée pour tous les animaux.',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 48 * 3600000).toISOString(),
      });
    }

    return alerts;
  }

  private generateForecast(days = 7): DayForecast[] {
    const now = new Date();
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(now.getTime() + i * 86400000);
      const rain = Math.random() > 0.45;
      return {
        date: date.toISOString().split('T')[0],
        tempMin: 23 + Math.floor(Math.random() * 3),
        tempMax: 29 + Math.floor(Math.random() * 5),
        humidity: 72 + Math.floor(Math.random() * 18),
        precipitation: rain ? Math.floor(5 + Math.random() * 25) : 0,
        description: rain ? 'Averses tropicales' : 'Partiellement nuageux',
        icon: rain ? '🌧️' : '⛅',
      };
    });
  }

  private assessAnimalImpact(temp: number, humidity: number): AnimalImpact[] {
    const impacts: AnimalImpact[] = [];

    if (temp > 34) {
      impacts.push({
        species: 'Ara ararauna',
        impact: 'high',
        recommendation: 'Augmenter la fréquence de brumisation. Réduire les activités physiques.',
        affectedCount: 8,
      });
      impacts.push({
        species: 'Dendrobates azureus',
        impact: 'critical',
        recommendation: 'URGENT : Maintenir humidité >85% dans les terrariums. Vérifier toutes les 2h.',
        affectedCount: 24,
      });
    }

    if (humidity > 90) {
      impacts.push({
        species: 'Boa constrictor',
        impact: 'medium',
        recommendation: 'Surveiller les signes de détresse respiratoire. Ventiler les enclos.',
        affectedCount: 3,
      });
    }

    if (temp < 22) {
      impacts.push({
        species: 'Caiman crocodilus',
        impact: 'high',
        recommendation: 'Activer le chauffage des bassins. Température minimale 24°C.',
        affectedCount: 2,
      });
    }

    if (impacts.length === 0) {
      impacts.push({
        species: 'Tous les animaux',
        impact: 'low',
        recommendation: 'Conditions météo favorables. Surveillance habituelle.',
        affectedCount: 247,
      });
    }

    return impacts;
  }
}
