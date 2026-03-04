import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnimauxCouveesService } from './animaux-couvees.service';
import { JwtAuthGuard } from '../../../apps/backend/src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../apps/backend/src/common/decorators/current-user.decorator';

@ApiTags('Plugin: Animaux & Couvées')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plugins/animaux')
export class AnimauxCouveesController {
  constructor(private service: AnimauxCouveesService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques globales animaux' })
  getStats() { return this.service.getStats(); }

  @Get('species')
  findAllSpecies() { return this.service.findAllSpecies(); }

  @Post('species')
  createSpecies(@Body() body: any) { return this.service.createSpecies(body); }

  @Get('enclosures')
  findAllEnclosures() { return this.service.findAllEnclosures(); }

  @Post('enclosures')
  createEnclosure(@Body() body: any) { return this.service.createEnclosure(body); }

  @Get('animals')
  @ApiOperation({ summary: 'Liste tous les animaux' })
  findAll(
    @Query('speciesId') speciesId?: string,
    @Query('enclosureId') enclosureId?: string,
    @Query('isAlive') isAlive?: string,
  ) {
    return this.service.findAllAnimals({
      speciesId,
      enclosureId,
      isAlive: isAlive !== undefined ? isAlive === 'true' : undefined,
    });
  }

  @Get('animals/:id')
  findOne(@Param('id') id: string) { return this.service.findAnimalById(id); }

  @Post('animals')
  @ApiOperation({ summary: 'Enregistre un nouvel animal' })
  create(@Body() body: any) { return this.service.createAnimal(body); }

  @Patch('animals/:id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.updateAnimal(id, body); }

  @Delete('animals/:id')
  @ApiOperation({ summary: 'Supprime un animal' })
  remove(@Param('id') id: string) { return this.service.deleteAnimal(id); }

  @Post('animals/:id/events')
  @ApiOperation({ summary: 'Ajoute un événement à un animal' })
  addEvent(@Param('id') animalId: string, @Body() body: any, @CurrentUser('id') userId: string) {
    return this.service.addEvent({ ...body, animalId, userId });
  }

  @Get('animals/:id/events')
  findEvents(@Param('id') animalId: string) { return this.service.findEventsByAnimal(animalId); }

  @Get('broods')
  @ApiOperation({ summary: 'Liste toutes les couvées' })
  findAllBroods() { return this.service.findAllBroods(); }

  @Post('broods')
  @ApiOperation({ summary: 'Crée une nouvelle couvée' })
  createBrood(@Body() body: any) { return this.service.createBrood(body); }

  @Get('broods/:id')
  findOneBrood(@Param('id') id: string) { return this.service.findBroodById(id); }

  @Patch('broods/:id')
  updateBrood(@Param('id') id: string, @Body() body: any) { return this.service.updateBrood(id, body); }

  @Delete('broods/:id')
  deleteBrood(@Param('id') id: string) { return this.service.deleteBrood(id); }
}
