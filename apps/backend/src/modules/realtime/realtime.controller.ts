import { Controller, Get, Sse, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Métriques temps réel actuelles' })
  getMetrics() {
    return this.realtimeService.getMetrics();
  }

  @Get('events')
  @ApiOperation({ summary: 'Événements live récents' })
  getEvents() {
    return this.realtimeService.getLiveEvents();
  }

  @Get('environment')
  @ApiOperation({ summary: 'Données environnementales des zones' })
  getEnvironment() {
    return this.realtimeService.getEnvironmentData();
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Stream SSE des métriques temps réel' })
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
