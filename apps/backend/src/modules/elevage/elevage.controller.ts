import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ElevageService } from './elevage.service';

@ApiTags('Élevage & Généalogie')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('elevage')
export class ElevageController {
  constructor(private readonly elevageService: ElevageService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques génétiques globales' })
  getGeneticStats() {
    return this.elevageService.getGeneticStats();
  }

  @Get('breeding-pairs')
  @ApiOperation({ summary: 'Lister les couples reproducteurs' })
  getBreedingPairs() {
    return this.elevageService.getBreedingPairs();
  }

  @Get('genealogy/:animalId')
  @ApiOperation({ summary: 'Arbre généalogique d\'un animal' })
  getGenealogy(
    @Param('animalId') animalId: string,
    @Query('depth') depth = 3,
  ) {
    return this.elevageService.getGenealogy(animalId, +depth);
  }

  @Get('suggest-pairings/:animalId')
  @ApiOperation({ summary: 'Suggestions d\'appariement pour un animal' })
  suggestPairings(@Param('animalId') animalId: string) {
    return this.elevageService.suggestPairings(animalId);
  }
}
