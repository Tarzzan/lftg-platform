// @ts-nocheck
import { Public } from '../../common/decorators/public.decorator';
import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PartnersService, CreatePartnerDto } from './partners.service';

@ApiTags('Partenaires API')
@ApiBearerAuth()
@Public()
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @ApiOperation({ summary: "Lister tous les partenaires" })
  findAll() { return this.partnersService.findAll(); }

  @Get("stats")
  @ApiOperation({ summary: "Statistiques des partenaires" })
  getStats() { return this.partnersService.getStats(); }

  @Get(":id")
  @ApiOperation({ summary: "Détail d\'un partenaire" })
  findOne(@Param('id') id: string) { return this.partnersService.findOne(id); }

  @Post()
  @ApiOperation({ summary: "Créer un partenaire et générer ses clés API" })
  create(@Body() dto: CreatePartnerDto) { return this.partnersService.create(dto); }

  @Patch(":id/suspend")
  @ApiOperation({ summary: "Suspendre un partenaire" })
  suspend(@Param("id") id: string) { return this.partnersService.suspend(id); }

  @Patch(':id/activate')
  @ApiOperation({ summary: "Activer un partenaire" })
  activate(@Param("id") id: string) { return this.partnersService.activate(id); }

  @Post(':id/rotate-key')
  @ApiOperation({ summary: "Renouveler les clés API d\'un partenaire" })
  rotateApiKey(@Param('id') id: string) { return this.partnersService.rotateApiKey(id); }

  @Post('validate')
  @ApiOperation({ summary: 'Valider une paire de clés API partenaire' })
  validateApiKey(@Body() body: { apiKey: string; secretKey: string }) {
    return this.partnersService.validateApiKey(body.apiKey, body.secretKey);
  }
}
