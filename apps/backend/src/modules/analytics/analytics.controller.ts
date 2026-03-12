import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
  @Get('dashboard')
  @ApiOperation({ summary: 'Statistiques du tableau de bord' })
  getDashboard(@Query('period') period?: string) {
    return { message: "Analytics en cours de développement", period };
  }
  @Get('health-trends')
  @ApiOperation({ summary: 'Tendances de santé des animaux' })
  getHealthTrends() { return []; }
  @Get('enclos-occupancy')
  @ApiOperation({ summary: 'Occupation des enclos' })
  getEnclosOccupancy() { return []; }
  @Get('custom-report')
  @ApiOperation({ summary: 'Rapport personnalisé' })
  getCustomReport() { return {}; }
}
