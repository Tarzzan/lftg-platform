// @ts-nocheck
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Controller, Get, Post, Body, Query, Param, UseGuards} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CitesApiService } from './cites-api.service';

@ApiTags('CITES API Externe')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cites-api')
export class CitesApiController {
  constructor(private readonly citesApiService: CitesApiService) {}

  @Get('search')
  @ApiOperation({ summary: "Rechercher une espèce dans la base CITES" })
  searchSpecies(@Query('q') query: string) {
    return this.citesApiService.searchSpecies(query || '');
  }

  @Get('species/:taxonId')
  @ApiOperation({ summary: "Détails CITES d'une espèce" })
  getSpeciesDetails(@Param('taxonId') taxonId: string) {
    return this.citesApiService.getSpeciesDetails(taxonId);
  }

  @Post('compliance-check')
  @ApiOperation({ summary: "Vérifier la conformité CITES d'une transaction" })
  checkCompliance(@Body() body: { speciesName: string; quantity: number; transactionType: string }) {
    return this.citesApiService.checkCompliance(body.speciesName, body.quantity, body.transactionType);
  }

  @Get('permit-templates')
  @ApiOperation({ summary: 'Modèles de permis CITES disponibles' })
  getPermitTemplates() {
    return this.citesApiService.getPermitTemplates();
  }
}
