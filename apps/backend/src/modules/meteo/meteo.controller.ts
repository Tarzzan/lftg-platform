import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { MeteoService } from './meteo.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Météo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meteo')
export class MeteoController {
  constructor(private readonly meteoService: MeteoService) {}

  @Get('current')
  @ApiOperation({ summary: 'Météo actuelle de Cayenne, Guyane' })
  @ApiResponse({ status: 200, description: 'Données météo actuelles' })
  getCurrentWeather() {
    return this.meteoService.getCurrentWeather();
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Prévisions sur N jours (défaut: 7)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Nombre de jours (1-14)' })
  @ApiResponse({ status: 200, description: 'Prévisions météo' })
  getForecast(@Query('days') days: string) {
    return this.meteoService.getForecast(parseInt(days) || 7);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Alertes météo actives' })
  @ApiResponse({ status: 200, description: 'Liste des alertes météo actives' })
  getAlerts() {
    return this.meteoService.getAlerts();
  }

  @Get('animal-impact')
  @ApiOperation({ summary: 'Impact météo sur les animaux du zoo' })
  @ApiResponse({ status: 200, description: 'Impacts météo par espèce' })
  getAnimalImpact() {
    return this.meteoService.getAnimalImpact();
  }

  @Get('history')
  @ApiOperation({ summary: 'Historique météo des N derniers jours (défaut: 30)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Nombre de jours d\'historique' })
  @ApiResponse({ status: 200, description: 'Historique météo' })
  getHistory(@Query('days') days: string) {
    return this.meteoService.getHistory(parseInt(days) || 30);
  }

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Météo publique pour la vitrine (sans authentification)' })
  @ApiResponse({ status: 200, description: 'Données météo publiques' })
  getPublicWeather() {
    return this.meteoService.getCurrentWeather();
  }
}
