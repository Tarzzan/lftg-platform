// @ts-nocheck
import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MlService } from './ml.service';

class MlPredictionDto {
  animalId?: string;
  modelType?: string;
  parameters?: Record<string, unknown>;
}

@ApiTags('Machine Learning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ml')
export class MlController {
  constructor(private readonly mlService: MlService) {}

  @Get('breeding-predictions')
  @ApiOperation({ summary: "Prédictions de reproduction" })
  getBreedingPredictions() {
    return this.mlService.getBreedingPredictions();
  }

  @Get('behavioral-anomalies')
  @ApiOperation({ summary: "Détection d'anomalies comportementales" })
  getBehavioralAnomalies() {
    return this.mlService.getBehavioralAnomalies();
  }

  @Get('nutrition-recommendations')
  @ApiOperation({ summary: "Recommandations nutritionnelles" })
  getNutritionRecommendations(@Query('animalId') animalId: string) {
    return this.mlService.getNutritionRecommendations(animalId);
  }

  @Post('predict')
  @ApiOperation({ summary: "Lancer une prédiction ML" })
  predict(@Body() dto: MlPredictionDto) {
    return this.mlService.predict?.(dto) ?? { prediction: null };
  }

  @Get("models")
  @ApiOperation({ summary: 'Liste des modèles ML disponibles' })
  getModels() {
    return this.mlService.getModels?.() ?? [];
  }
}
