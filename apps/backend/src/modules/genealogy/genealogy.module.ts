import { Module } from '@nestjs/common';
import { GenealogyController } from './genealogy.controller';
import { GenealogyService } from './genealogy.service';

@Module({
  controllers: [GenealogyController],
  providers: [GenealogyService],
})
export class GenealogyModule {}
