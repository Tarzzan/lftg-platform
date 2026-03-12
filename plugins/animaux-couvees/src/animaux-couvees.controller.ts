import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AnimauxCouveesService } from './animaux-couvees.service';
import { JwtAuthGuard } from '../../../apps/backend/src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../apps/backend/src/common/decorators/current-user.decorator';

@ApiTags('Plugin: Animaux & Couvées')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plugins/animaux')
export class AnimauxCouveesController {
  constructor(private service: AnimauxCouveesService) {}

  // ─── Stats ───────────────────────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'Statistiques globales animaux' })
  getStats() { return this.service.getStats(); }

  // ─── Species ─────────────────────────────────────────────────────────────
  @Get('species')
  findAllSpecies() { return this.service.findAllSpecies(); }

  @Post('species')
  @ApiOperation({ summary: 'Créer une nouvelle espèce' })
  createSpecies(@Body() body: any) { return this.service.createSpecies(body); }

  @Put('species/:id')
  @ApiOperation({ summary: 'Modifier une espèce' })
  updateSpecies(@Param('id') id: string, @Body() body: any) {
    return this.service.updateSpecies(id, body);
  }

  @Patch('species/:id')
  @ApiOperation({ summary: 'Modifier partiellement une espèce' })
  patchSpecies(@Param('id') id: string, @Body() body: any) {
    return this.service.updateSpecies(id, body);
  }

  @Delete('species/:id')
  @ApiOperation({ summary: 'Supprimer une espèce' })
  deleteSpecies(@Param('id') id: string) {
    return this.service.deleteSpecies(id);
  }

  @Post('species/:id/image')
  @ApiOperation({ summary: 'Uploader une image pour une espèce' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'species'),
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `species-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Seules les images sont acceptées'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  }))
  async uploadSpeciesImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    const imageUrl = `/uploads/species/${file.filename}`;
    return this.service.updateSpecies(id, { imageUrl });
  }

  // ─── Enclosures ──────────────────────────────────────────────────────────
  @Get('enclosures')
  findAllEnclosures() { return this.service.findAllEnclosures(); }

  @Post('enclosures')
  createEnclosure(@Body() body: any) { return this.service.createEnclosure(body); }

  @Put('enclosures/:id')
  updateEnclosure(@Param('id') id: string, @Body() body: any) {
    return this.service.updateEnclosure(id, body);
  }

  @Patch('enclosures/:id')
  patchEnclosure(@Param('id') id: string, @Body() body: any) {
    return this.service.updateEnclosure(id, body);
  }

  @Delete('enclosures/:id')
  deleteEnclosure(@Param('id') id: string) {
    return this.service.deleteEnclosure(id);
  }

  // ─── Animals ─────────────────────────────────────────────────────────────
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

  @Put('animals/:id')
  updateFull(@Param('id') id: string, @Body() body: any) { return this.service.updateAnimal(id, body); }

  @Delete('animals/:id')
  @ApiOperation({ summary: 'Supprime un animal' })
  remove(@Param('id') id: string) { return this.service.deleteAnimal(id); }


  @Post('animals/:id/image')
  @ApiOperation({ summary: 'Upload une image pour un animal' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'animals'),
      filename: (_req: any, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `animal-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (_req: any, file: any, cb: any) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Seules les images sont acceptées'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadAnimalImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    const imageUrl = `/uploads/animals/${file.filename}`;
    return this.service.updateAnimal(id, { imageUrl });
  }

  @Post('animals/:id/events')
  @ApiOperation({ summary: 'Ajoute un événement à un animal' })
  addEvent(
    @Param('id') animalId: string,
    @Body() body: any,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.addEvent({ ...body, animalId, userId });
  }

  @Get('animals/:id/events')
  findEvents(@Param('id') animalId: string) { return this.service.findEventsByAnimal(animalId); }

  // ─── Broods ──────────────────────────────────────────────────────────────
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

  @Put('broods/:id')
  updateBroodFull(@Param('id') id: string, @Body() body: any) { return this.service.updateBrood(id, body); }

  @Delete('broods/:id')
  deleteBrood(@Param('id') id: string) { return this.service.deleteBrood(id); }
}
