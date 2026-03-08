import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Controller, Get, UseGuards} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@UseGuards(JwtAuthGuard)
@@Controller('analytics')
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
