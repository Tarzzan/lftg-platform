// @ts-nocheck
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CitesService, CitesPermitDto } from './cites.service';

@ApiTags('CITES')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cites')
export class CitesController {
  constructor(private readonly citesService: CitesService) {}

  @Get('check')
  @ApiOperation({ summary: 'Vérifier le statut CITES d\'une espèce (via query)' })
  async checkSpeciesQuery(@Query('scientificName') scientificName: string) {
    return this.citesService.checkSpecies(scientificName);
  }

  @Get('check/:scientificName')
  @ApiOperation({ summary: 'Vérifier le statut CITES d\'une espèce (via param)' })
  async checkSpeciesParam(@Param('scientificName') scientificName: string) {
    return this.citesService.checkSpecies(decodeURIComponent(scientificName));
  }

  @Get('permits')
  @ApiOperation({ summary: 'Lister tous les permis CITES' })
  async getAllPermits(@Query('status') status?: string, @Query('type') type?: string) {
    return this.citesService.getAllPermits({ status, type });
  }

  @Get('permits/expiring')
  @ApiOperation({ summary: 'Permis expirant bientôt' })
  async getExpiringPermits(@Query('daysAhead') daysAhead?: string) {
    return this.citesService.getExpiringPermits(daysAhead ? parseInt(daysAhead) : 30);
  }

  @Get('permits/animal/:animalId')
  @ApiOperation({ summary: 'Permis CITES d\'un animal' })
  async getPermitsByAnimal(@Param('animalId') animalId: string) {
    return this.citesService.getPermitsByAnimal(animalId);
  }

  @Get('compliance')
  @ApiOperation({ summary: 'Rapport de conformité CITES' })
  async getComplianceReport() {
    return this.citesService.generateComplianceReport();
  }

  @Get('compliance-report')
  @ApiOperation({ summary: 'Rapport de conformité CITES (alias)' })
  async getComplianceReportAlias() {
    return this.citesService.generateComplianceReport();
  }

  @Post('permits')
  @ApiOperation({ summary: 'Créer un permis CITES' })
  async createPermit(@Body() dto: CitesPermitDto, @Request() req: any) {
    return this.citesService.createPermit(dto, req.user.id);
  }

  @Patch('permits/:id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un permis' })
  async updatePermitStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED' | 'PENDING',
  ) {
    return this.citesService.updatePermitStatus(id, status);
  }
}
