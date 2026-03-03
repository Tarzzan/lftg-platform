import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MeteoService } from './meteo.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Météo')
@ApiBearerAuth()
@Controller('meteo')
export class MeteoController {
  constructor(private readonly meteoService: MeteoService) {}

  @Get('current')
  @ApiOperation({ summary: 'Météo actuelle de Cayenne, Guyane' })
  getCurrentWeather() {
    return this.meteoService.getCurrentWeather();
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Prévisions sur 7 jours' })
  getForecast(@Query('days') days: string) {
    return this.meteoService.getForecast(parseInt(days) || 7);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Alertes météo actives' })
  getAlerts() {
    return this.meteoService.getAlerts();
  }

  @Get('animal-impact')
  @ApiOperation({ summary: 'Impact météo sur les animaux' })
  getAnimalImpact() {
    return this.meteoService.getAnimalImpact();
  }

  @Get('history')
  @ApiOperation({ summary: 'Historique météo (30 jours)' })
  getHistory(@Query('days') days: string) {
    return this.meteoService.getHistory(parseInt(days) || 30);
  }

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Météo publique pour la vitrine' })
  getPublicWeather() {
    return this.meteoService.getCurrentWeather();
  }
}
