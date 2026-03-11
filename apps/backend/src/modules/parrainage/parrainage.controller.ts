import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ParrainageService } from './parrainage.service';

@ApiTags('parrainage')
@Controller('parrainage')
export class ParrainageController {
  constructor(private readonly parrainageService: ParrainageService) {}

  @Public()
  @Get('animals')
  @ApiOperation({ summary: 'Animaux disponibles au parrainage (public)' })
  getAvailableAnimals() {
    return this.parrainageService.getAvailableAnimals();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Lister les parrainages' })
  getSponsorships() {
    return this.parrainageService.getSponsorships();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  @ApiOperation({ summary: 'Statistiques parrainage' })
  getStats() {
    return this.parrainageService.getStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: "Détail d\'un parrainage" })
  getSponsorship(@Param('id') id: string) {
    return this.parrainageService.getSponsorshipById(id);
  }
}
