import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrevisionsService } from './previsions.service';

@ApiTags('Prévisions BI')
@ApiBearerAuth()
@Controller('previsions')
export class PrevisionsController {
  constructor(private readonly previsionsService: PrevisionsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Prévisions de revenus (régression linéaire)' })
  getRevenueForecast(@Query('months') months?: string) {
    return this.previsionsService.getRevenueForecast(parseInt(months || '6'));
  }

  @Get('population')
  @ApiOperation({ summary: 'Prévisions de population animale' })
  getAnimalPopulationForecast() {
    return this.previsionsService.getAnimalPopulationForecast();
  }

  @Get('stock')
  @ApiOperation({ summary: 'Prévisions de rupture de stock' })
  getStockForecast() {
    return this.previsionsService.getStockForecast();
  }

  @Get('visites')
  @ApiOperation({ summary: 'Prévisions de fréquentation touristique' })
  getVisiteForecast() {
    return this.previsionsService.getVisiteForecast();
  }
}
