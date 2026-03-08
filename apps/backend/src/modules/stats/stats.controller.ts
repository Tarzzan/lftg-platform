import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StatsService } from './stats.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.statsService.getDashboardStats();
  }

  @Get('animals/by-species')
  getAnimalsBySpecies() {
    return this.statsService.getAnimalsBySpecies();
  }

  @Get('stock/evolution')
  getStockEvolution(@Query('days') days?: string) {
    return this.statsService.getStockEvolution(days ? parseInt(days) : 30);
  }

  @Get('workflows/by-state')
  getWorkflowsByState() {
    return this.statsService.getWorkflowsByState();
  }

  @Get('formation/progress')
  getFormationProgress() {
    return this.statsService.getFormationProgress();
  }
}
