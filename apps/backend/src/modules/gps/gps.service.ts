import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GpsTracker {
  id: string;
  animalId: string;
  animalName: string;
  species: string;
  deviceId: string;
  batteryLevel: number;
  lastSeen: Date;
  status: 'active' | 'inactive' | 'low_battery' | 'lost';
  currentPosition: GpsPosition;
  zone: string;
  geofenceStatus: 'inside' | 'outside' | 'alert';
}

export interface GpsPosition {
  lat: number;
  lng: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
  speed?: number;
}

export interface GpsTrail {
  trackerId: string;
  animalId: string;
  positions: GpsPosition[];
  distance: number;
  duration: number;
}

export interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  center?: { lat: number; lng: number };
  radius?: number;
  coordinates?: { lat: number; lng: number }[];
  color: string;
  alertOnExit: boolean;
  alertOnEntry: boolean;
}

@Injectable()
export class GpsService {
  private readonly logger = new Logger(GpsService.name);

  // Coordonnées de la ferme LFTG (Guyane française, près de Cayenne)
  private readonly farmCenter = { lat: 4.9372, lng: -52.3260 };

  private readonly mockTrackers: GpsTracker[] = [
    {
      id: 'tracker-001',
      animalId: 'anim-001',
      animalName: 'Ara Macao AM-001',
      species: 'Ara macao',
      deviceId: 'GPS-BT-001',
      batteryLevel: 87,
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      status: 'active',
      currentPosition: { lat: 4.9380, lng: -52.3255, altitude: 12, accuracy: 3, timestamp: new Date(), speed: 0.2 },
      zone: 'Volière Principale',
      geofenceStatus: 'inside',
    },
    {
      id: 'tracker-002',
      animalId: 'anim-005',
      animalName: 'Ara Ararauna AA-005',
      species: 'Ara ararauna',
      deviceId: 'GPS-BT-002',
      batteryLevel: 23,
      lastSeen: new Date(Date.now() - 2 * 60 * 1000),
      status: 'low_battery',
      currentPosition: { lat: 4.9365, lng: -52.3270, altitude: 8, accuracy: 5, timestamp: new Date(), speed: 1.4 },
      zone: 'Zone Libre Surveillée',
      geofenceStatus: 'inside',
    },
    {
      id: 'tracker-003',
      animalId: 'anim-012',
      animalName: 'Caïman CL-012',
      species: 'Caiman crocodilus',
      deviceId: 'GPS-WP-003',
      batteryLevel: 65,
      lastSeen: new Date(Date.now() - 15 * 60 * 1000),
      status: 'active',
      currentPosition: { lat: 4.9355, lng: -52.3280, altitude: 1, accuracy: 8, timestamp: new Date(), speed: 0 },
      zone: 'Mare Centrale',
      geofenceStatus: 'inside',
    },
    {
      id: 'tracker-004',
      animalId: 'anim-018',
      animalName: 'Boa BC-018',
      species: 'Boa constrictor',
      deviceId: 'GPS-SM-004',
      batteryLevel: 91,
      lastSeen: new Date(Date.now() - 1 * 60 * 1000),
      status: 'active',
      currentPosition: { lat: 4.9390, lng: -52.3245, altitude: 3, accuracy: 4, timestamp: new Date(), speed: 0 },
      zone: 'Serre Reptiles',
      geofenceStatus: 'inside',
    },
    {
      id: 'tracker-005',
      animalId: 'anim-022',
      animalName: 'Amazone AZ-022',
      species: 'Amazona amazonica',
      deviceId: 'GPS-BT-005',
      batteryLevel: 54,
      lastSeen: new Date(Date.now() - 45 * 60 * 1000),
      status: 'active',
      currentPosition: { lat: 4.9410, lng: -52.3230, altitude: 15, accuracy: 6, timestamp: new Date(), speed: 3.2 },
      zone: 'Périmètre Nord',
      geofenceStatus: 'alert',
    },
  ];

  private readonly mockGeofences: Geofence[] = [
    {
      id: 'geo-001',
      name: 'Périmètre principal',
      type: 'polygon',
      coordinates: [
        { lat: 4.9420, lng: -52.3300 },
        { lat: 4.9420, lng: -52.3200 },
        { lat: 4.9330, lng: -52.3200 },
        { lat: 4.9330, lng: -52.3300 },
      ],
      color: '#16a34a',
      alertOnExit: true,
      alertOnEntry: false,
    },
    {
      id: 'geo-002',
      name: 'Volière Principale',
      type: 'circle',
      center: { lat: 4.9380, lng: -52.3255 },
      radius: 50,
      color: '#2563eb',
      alertOnExit: true,
      alertOnEntry: false,
    },
    {
      id: 'geo-003',
      name: 'Mare Centrale',
      type: 'circle',
      center: { lat: 4.9355, lng: -52.3280 },
      radius: 30,
      color: '#0891b2',
      alertOnExit: true,
      alertOnEntry: false,
    },
    {
      id: 'geo-004',
      name: 'Zone Libre Surveillée',
      type: 'polygon',
      coordinates: [
        { lat: 4.9400, lng: -52.3290 },
        { lat: 4.9400, lng: -52.3240 },
        { lat: 4.9350, lng: -52.3240 },
        { lat: 4.9350, lng: -52.3290 },
      ],
      color: '#d97706',
      alertOnExit: true,
      alertOnEntry: false,
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async getTrackers(): Promise<GpsTracker[]> {
    return this.mockTrackers;
  }

  async getTrackerById(id: string): Promise<GpsTracker | undefined> {
    return this.mockTrackers.find(t => t.id === id);
  }

  async getTrackerTrail(trackerId: string, hours: number = 6): Promise<GpsTrail> {
    const tracker = this.mockTrackers.find(t => t.id === trackerId);
    if (!tracker) throw new Error(`Tracker ${trackerId} not found`);

    // Générer un trail simulé
    const positions: GpsPosition[] = [];
    const now = Date.now();
    const steps = Math.min(hours * 4, 48); // 1 point toutes les 15 min

    for (let i = steps; i >= 0; i--) {
      const jitter = () => (Math.random() - 0.5) * 0.002;
      positions.push({
        lat: tracker.currentPosition.lat + jitter(),
        lng: tracker.currentPosition.lng + jitter(),
        altitude: tracker.currentPosition.altitude,
        accuracy: 5,
        timestamp: new Date(now - i * 15 * 60 * 1000),
        speed: Math.random() * 2,
      });
    }

    return {
      trackerId,
      animalId: tracker.animalId,
      positions,
      distance: Math.round(Math.random() * 500 + 100),
      duration: hours * 60,
    };
  }

  async getGeofences(): Promise<Geofence[]> {
    return this.mockGeofences;
  }

  async getGpsStats() {
    const trackers = await this.getTrackers();
    return {
      total: trackers.length,
      active: trackers.filter(t => t.status === 'active').length,
      lowBattery: trackers.filter(t => t.status === 'low_battery').length,
      alerts: trackers.filter(t => t.geofenceStatus === 'alert').length,
      geofences: this.mockGeofences.length,
      lastUpdate: new Date(),
    };
  }
}
