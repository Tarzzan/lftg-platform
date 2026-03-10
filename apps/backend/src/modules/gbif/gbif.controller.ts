// @ts-nocheck
import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GbifService } from './gbif.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('GBIF Biodiversité')
@ApiBearerAuth()
@Controller('gbif')
export class GbifController {
  constructor(private readonly gbifService: GbifService) {}

  @Get('species')
  @ApiOperation({ summary: "Rechercher une espèce dans GBIF" })
  searchSpecies(@Query('q') query: string, @Query('limit') limit: string) {
    return this.gbifService.searchSpecies(query || '', parseInt(limit) || 10);
  }

  @Get('species/all')
  @ApiOperation({ summary: "Toutes les espèces LFTG enrichies GBIF" })
  getAllSpecies() { return this.gbifService.getAllSpecies(); }

  @Get('stats')
  @ApiOperation({ summary: "Statistiques de biodiversité" })
  getBiodiversityStats() { return this.gbifService.getBiodiversityStats(); }

  @Get("species/:name/details")
  @ApiOperation({ summary: "Détails d'une espèce" })
  getSpeciesDetails(@Param('name') name: string) {
    return this.gbifService.getSpeciesDetails(name);
  }

  @Get('species/:name/occurrences')
  @ApiOperation({ summary: "Occurrences en Guyane" })
  getOccurrences(@Param('name') name: string) {
    return this.gbifService.getOccurrencesInGuyane(name);
  }

  @Get('species/:name/conservation')
  @ApiOperation({ summary: "Statut de conservation UICN + CITES" })
  checkConservation(@Param("name") name: string) {
    return this.gbifService.checkConservationStatus(name);
  }

  @Public()
  @Get('public/stats')
  @ApiOperation({ summary: 'Statistiques publiques de biodiversité' })
  getPublicStats() { return this.gbifService.getBiodiversityStats(); }
}
