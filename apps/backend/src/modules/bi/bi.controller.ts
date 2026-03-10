// @ts-nocheck
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BiService } from './bi.service';

class BiFilterDto {
  period?: 'week' | 'month' | 'quarter' | 'year';
  from?: string;
  to?: string;
}

@ApiTags('Business Intelligence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bi')
export class BiController {
  constructor(private readonly biService: BiService) {}

  @Get('dashboard')
  @ApiOperation({ summary: "Tableau de bord BI complet" })
  @ApiQuery({ name: "period", required: false, enum: ['week', 'month', 'quarter', 'year'] })
  getDashboard(@Query('period') period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    return this.biService.getDashboard(period);
  }

  @Get('forecast')
  @ApiOperation({ summary: "Prévisions de revenus" })
  getRevenueForecast(@Query("months") months = 6) {
    return this.biService.getRevenueForecast(+months);
  }

  @Get('animal-health-trend')
  @ApiOperation({ summary: "Tendance de santé des animaux" })
  getAnimalHealthTrend(@Query("days") days = 30) {
    return this.biService.getAnimalHealthTrend(+days);
  }

  @Post('custom-report')
  @ApiOperation({ summary: "Rapport BI personnalisé" })
  getCustomReport(@Body() filter: BiFilterDto) {
    return this.biService.getCustomReport?.(filter) ?? { data: [] };
  }

  @Get("kpis")
  @ApiOperation({ summary: 'Indicateurs clés de performance' })
  getKpis() {
    return this.biService.getKpis?.() ?? {};
  }
}
