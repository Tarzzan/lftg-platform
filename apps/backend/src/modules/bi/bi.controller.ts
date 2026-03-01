import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BiService } from './bi.service';

@ApiTags('Business Intelligence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bi')
export class BiController {
  constructor(private readonly biService: BiService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Tableau de bord BI complet' })
  getDashboard(@Query('period') period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    return this.biService.getDashboard(period);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Prévisions de revenus' })
  getRevenueForecast(@Query('months') months = 6) {
    return this.biService.getRevenueForecast(+months);
  }

  @Get('animal-health-trend')
  @ApiOperation({ summary: 'Tendance de santé des animaux' })
  getAnimalHealthTrend(@Query('days') days = 30) {
    return this.biService.getAnimalHealthTrend(+days);
  }
}
