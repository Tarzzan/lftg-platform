// @ts-nocheck
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StatsService } from './stats.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: "Statistiques globales du tableau de bord" })
  @ApiResponse({ status: 200, description: "Statistiques animaux, stock, workflows, RH, formation" })
  getDashboard() {
    return this.statsService.getDashboardStats();
  }

  @Get('animals/by-species')
  @ApiOperation({ summary: "Nombre d'animaux actifs par espèce" })
  @ApiResponse({ status: 200, description: "Liste triée des espèces avec leur effectif" })
  getAnimalsBySpecies() {
    return this.statsService.getAnimalsBySpecies();
  }

  @Get('stock/evolution')
  @ApiOperation({ summary: "Evolution des mouvements de stock sur N jours" })
  @ApiQuery({ name: 'days', required: false, description: "Nombre de jours (défaut: 30)" })
  @ApiResponse({ status: 200, description: "Entrées et sorties de stock par jour" })
  getStockEvolution(@Query('days') days?: string) {
    return this.statsService.getStockEvolution(days ? parseInt(days) : 30);
  }

  @Get('workflows/by-state')
  @ApiOperation({ summary: "Répartition des workflows par état" })
  @ApiResponse({ status: 200, description: "Nombre de workflows par état" })
  getWorkflowsByState() {
    return this.statsService.getWorkflowsByState();
  }

  @Get('formation/progress')
  @ApiOperation({ summary: "Progression des inscriptions aux formations" })
  @ApiResponse({ status: 200, description: "Nombre d'inscriptions terminées vs en cours" })
  getFormationProgress() {
    return this.statsService.getFormationProgress();
  }

  @Get('species/:id/animals')
  @ApiOperation({ summary: "Animaux actifs pour une espèce donnée" })
  @ApiParam({ name: 'id', description: "ID de l'espèce" })
  @ApiResponse({ status: 200, description: "Statistiques des animaux de cette espèce" })
  getAnimalsBySpeciesId(@Param('id') id: string) {
    return this.statsService.getAnimalsBySpecies();
  }
}
