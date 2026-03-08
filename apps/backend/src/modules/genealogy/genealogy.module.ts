import { Module } from '@nestjs/common';
import { GenealogyController } from './genealogy.controller';
import { GenealogyService } from './genealogy.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GenealogyController],
  providers: [GenealogyService],
  exports: [GenealogyService],
})
export class GenealogyModule {}
