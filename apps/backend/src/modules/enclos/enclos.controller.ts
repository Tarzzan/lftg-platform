// @ts-nocheck
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EnclosService, CreateEnclosDto, UpdateEnclosDto } from './enclos.service';

@ApiTags('Enclos')
@ApiBearerAuth()
@Controller('enclos')
@UseGuards(JwtAuthGuard)
export class EnclosController {
  constructor(private readonly enclosService: EnclosService) {}

  @Get()
  @ApiOperation({ summary: "Lister tous les enclos" })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.enclosService.findAll({ type, status, search });
  }

  @Get('stats')
  @ApiOperation({ summary: "Statistiques globales des enclos" })
  getStats() {
    return this.enclosService.getStats();
  }

  @Get('geojson')
  @ApiOperation({ summary: "Données GeoJSON pour la carte Leaflet" })
  getGeoJson() {
    return this.enclosService.getGeoJson();
  }

  @Get(":id")
  @ApiOperation({ summary: "Détail d'un enclos avec ses animaux" })
  findOne(@Param('id') id: string) {
    return this.enclosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Créer un enclos" })
  create(@Body() dto: CreateEnclosDto, @Request() req: any) {
    return this.enclosService.create(dto, req.user.id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Modifier un enclos" })
  update(@Param('id') id: string, @Body() dto: UpdateEnclosDto, @Request() req: any) {
    return this.enclosService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer un enclos (vide uniquement)" })
  remove(@Param("id") id: string, @Request() req: any) {
    return this.enclosService.remove(id, req.user.id);
  }
}
