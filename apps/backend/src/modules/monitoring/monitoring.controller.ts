import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Sse,
  MessageEvent,
  UseGuards,
} from '@nestjs/common';
import { Observable, map, interval, merge } from 'rxjs';
import { MonitoringService } from './monitoring.service';
import { EmailService } from "../email/email.service";
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Monitoring')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly emailService: EmailService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques CRUD des dernières N heures' })
  async getStats(@Query('hours') hours = '24') {
    return this.monitoringService.getStats(parseInt(hours, 10));
  }

  @Get('history')
  @ApiOperation({ summary: 'Historique agrege sur 7 jours (par jour)' })
  async getHistory() {
    return this.monitoringService.getErrorHistory();
  }

  @Get('logs')
  @ApiOperation({ summary: 'Logs detailles des N dernieres heures' })
  async getLogs(
    @Query('hours') hours = '24',
    @Query('limit') limit = '100',
    @Query('errorsOnly') errorsOnly = 'false',
  ) {
    return this.monitoringService.getLogs(
      parseInt(hours, 10),
      parseInt(limit, 10),
      errorsOnly === 'true',
    );
  }

  @Get('report')
  @ApiOperation({ summary: 'Rapport quotidien en texte brut' })
  async getReport() {
    const report = await this.monitoringService.generateDailyReport();
    return { report };
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Flux SSE des erreurs CRUD en temps réel' })
  stream(): Observable<MessageEvent> {
    // Fusionner le flux d'erreurs réelles + un heartbeat toutes les 30s
    const errorStream = this.monitoringService.errorStream.pipe(
      map((event) => ({
        type: event.success ? 'crud.success' : event.statusCode >= 500 ? 'crud.error.critical' : 'crud.error.warning',
        data: JSON.stringify(event),
      })),
    );

    const heartbeat = interval(30000).pipe(
      map(() => ({
        type: 'heartbeat',
        data: JSON.stringify({ timestamp: new Date().toISOString() }),
      })),
    );

    return merge(errorStream, heartbeat);
  }

  @Get('health')
  @ApiOperation({ summary: 'Santé du système de monitoring' })
  async health() {
    const stats = await this.monitoringService.getStats(1);
    return {
      status: stats.successRate >= 95 ? 'healthy' : stats.successRate >= 80 ? 'degraded' : 'critical',
      successRate: stats.successRate,
      errorsLastHour: stats.errors,
      totalLastHour: stats.total,
      timestamp: new Date().toISOString(),
    };
  }

  @Post("alert-email")
  @ApiOperation({ summary: "Envoyer une alerte email (utilisé par le watchdog)" })
  async sendAlertEmail(
    @Body() body: { to: string; subject: string; body: string },
  ) {
    const result = await this.emailService.sendEmail({
      to: body.to,
      subject: body.subject,
      html: `<pre style="font-family:monospace;padding:20px;background:#f5f5f5;">${body.body}</pre>`,
      text: body.body,
    });
    return result;
  }

}