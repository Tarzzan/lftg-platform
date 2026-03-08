// @ts-nocheck
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GenealogyService } from './genealogy.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Genealogy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('genealogy')
export class GenealogyController {
  constructor(private readonly genealogyService: GenealogyService) {}

  @Get()
  getAllAnimalsWithGenealogy() {
    return this.genealogyService.getAllAnimalsWithGenealogy();
  }

  @Get('tree/:animalId')
  getGenealogyTree(@Param('animalId') animalId: string) {
    return this.genealogyService.getGenealogyTree(animalId);
  }

  @Get('inbreeding/:animalId')
  getInbreedingCoefficient(@Param('animalId') animalId: string) {
    return this.genealogyService.getInbreedingCoefficient(animalId);
  }
}
