import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AlertesService } from './alertes.service';

@ApiTags('alertes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alertes')
export class AlertesController {
  constructor(private readonly alertesService: AlertesService) {}

  @Get()
  @ApiOperation({ summary: "Lister les alertes avec filtres' })
  getAlerts(
    @Query("severity') severity?: string,
    @Query('type') type?: string,
    @Query('acknowledged') acknowledged?: string,
    @Query('resolved') resolved?: string,
  ) {
    return this.alertesService.getAlerts({
      severity,
      type,
      acknowledged: acknowledged !== undefined ? acknowledged === 'true' : undefined,
      resolved: resolved !== undefined ? resolved === 'true' : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: "Statistiques des alertes' })
  getStats() {
    return this.alertesService.getAlertStats();
  }

  @Get("rules')
  @ApiOperation({ summary: "Règles d\'alerte configurées" })
  getRules() {
    return this.alertesService.getRules();
  }

  @Post('check')
  @ApiOperation({ summary: "Déclencher un cycle de vérification des alertes' })
  runCheck() {
    return this.alertesService.runAlertCheck();
  }

  @Patch(":id/acknowledge')
  @ApiOperation({ summary: "Acquitter une alerte' })
  acknowledge(@Param("id') id: string, @Body() body: { userId: string }) {
    return this.alertesService.acknowledgeAlert(id, body.userId || 'admin@lftg.fr');
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: "Résoudre une alerte' })
  resolve(@Param("id') id: string) {
    return this.alertesService.resolveAlert(id);
  }
}
