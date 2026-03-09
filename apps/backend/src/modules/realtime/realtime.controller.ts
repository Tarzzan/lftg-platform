import { Controller, Get, Param, Sse, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Observable, interval, map } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RealtimeService } from './realtime.service';

@ApiTags('realtime')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Métriques temps réel actuelles (IoT, capteurs, alertes)' })
  @ApiResponse({ status: 200, description: 'Métriques en temps réel' })
  getMetrics() {
    return this.realtimeService.getMetrics();
  }

  @Get('events')
  @ApiOperation({ summary: 'Événements live récents (alertes, mouvements, repas)' })
  @ApiResponse({ status: 200, description: 'Liste des événements récents' })
  getEvents() {
    return this.realtimeService.getLiveEvents();
  }

  @Get('environment')
  @ApiOperation({ summary: 'Données environnementales des zones (température, humidité)' })
  @ApiResponse({ status: 200, description: 'Données environnementales par zone' })
  getEnvironment() {
    return this.realtimeService.getEnvironmentData();
  }

  @Get('environment/:zone')
  @ApiOperation({ summary: 'Données environnementales d\'une zone spécifique' })
  @ApiParam({ name: 'zone', description: 'Identifiant de la zone (ex: reptiles, oiseaux)' })
  @ApiResponse({ status: 200, description: 'Données environnementales de la zone' })
  getEnvironmentByZone(@Param('zone') zone: string) {
    const all = this.realtimeService.getEnvironmentData();
    return Array.isArray(all) ? all.filter((d: any) => d.zone === zone) : all;
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Stream SSE des métriques temps réel (toutes les 5s)' })
  streamMetrics(): Observable<MessageEvent> {
    return interval(5000).pipe(
      map(() => {
        const data = {
          metrics: this.realtimeService.getMetrics(),
          events: this.realtimeService.getLiveEvents().slice(0, 3),
          environment: this.realtimeService.getEnvironmentData(),
          timestamp: new Date(),
        };
        return { data: JSON.stringify(data) } as MessageEvent;
      }),
    );
  }
}
