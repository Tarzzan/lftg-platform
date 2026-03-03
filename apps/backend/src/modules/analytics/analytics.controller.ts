import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('births')
  getBirthsByMonth() {
    return this.analyticsService.getBirthsByMonth();
  }

  @Get('species')
  getSpeciesDistribution() {
    return this.analyticsService.getSpeciesDistribution();
  }
}
