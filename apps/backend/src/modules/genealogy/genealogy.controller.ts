import { Controller, Get, Param } from '@nestjs/common';
import { GenealogyService } from './genealogy.service';

@Controller('genealogy')
export class GenealogyController {
  constructor(private readonly genealogyService: GenealogyService) {}

  @Get('tree/:animalId')
  getGenealogyTree(@Param('animalId') animalId: string) {
    return this.genealogyService.getGenealogyTree(animalId);
  }

  @Get('inbreeding/:animalId')
  getInbreedingCoefficient(@Param('animalId') animalId: string) {
    return this.genealogyService.getInbreedingCoefficient(animalId);
  }
}
