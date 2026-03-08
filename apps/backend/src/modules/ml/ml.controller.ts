import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Controller, Get, Post, Body, Query, UseGuards} from '@nestjs/common';
import { MlService } from './ml.service';

@UseGuards(JwtAuthGuard)
@@Controller('ml')
export class MlController {
  constructor(private readonly mlService: MlService) {}

  @Get('breeding-predictions')
  getBreedingPredictions() {
    return this.mlService.getBreedingPredictions();
  }

  @Get('behavioral-anomalies')
  getBehavioralAnomalies() {
    return this.mlService.getBehavioralAnomalies();
  }

  @Get('nutrition-recommendations')
  getNutritionRecommendations(@Query('animalId') animalId: string) {
    return this.mlService.getNutritionRecommendations(animalId);
  }
}
