import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NutritionService } from './nutrition.service';

@ApiTags('nutrition')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Lister les plans nutritionnels' })
  getPlans() {
    return this.nutritionService.getPlans();
  }

  @Get('plans/:id')
  @ApiOperation({ summary: "Détail d\'un plan nutritionnel" })
  getPlan(@Param('id') id: string) {
    return this.nutritionService.getPlanById(id);
  }

  @Get('records')
  @ApiOperation({ summary: 'Historique des repas' })
  getRecords(@Query('date') date?: string) {
    return this.nutritionService.getFeedingRecords(date);
  }

  @Get('schedule/today')
  @ApiOperation({ summary: 'Planning des repas du jour' })
  getTodaySchedule() {
    return this.nutritionService.getTodaySchedule();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques nutritionnelles' })
  getStats() {
    return this.nutritionService.getNutritionStats();
  }
}
