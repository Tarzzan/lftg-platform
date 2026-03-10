// @ts-nocheck
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

class AnalyticsFilterDto {
  period?: string;
  from?: string;
  to?: string;
}

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('births')
  @ApiOperation({ summary: "Naissances par mois" })
  @ApiResponse({ status: 200, description: "Statistiques de naissances" })
  getBirthsByMonth(@Query('year') year?: string) {
    return this.analyticsService.getBirthsByMonth(year ? +year : undefined);
  }

  @Get('species')
  @ApiOperation({ summary: "Distribution par espèce" })
  getSpeciesDistribution() {
    return this.analyticsService.getSpeciesDistribution();
  }

  @Get('health-trends')
  @ApiOperation({ summary: "Tendances de santé" })
  getHealthTrends(@Query('days') days?: string) {
    return this.analyticsService.getHealthTrends?.(+days || 30) ?? [];
  }

  @Get('enclos-occupancy')
  @ApiOperation({ summary: "Taux d'occupation des enclos" })
  getEnclosOccupancy() {
    return this.analyticsService.getEnclosOccupancy?.() ?? [];
  }

  @Post('custom')
  @ApiOperation({ summary: 'Rapport analytique personnalisé' })
  getCustomReport(@Body() filter: AnalyticsFilterDto) {
    return this.analyticsService.getCustomReport?.(filter) ?? { data: [] };
  }
}
