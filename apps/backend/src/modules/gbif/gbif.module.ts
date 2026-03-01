import { Module } from '@nestjs/common';
import { GbifService } from './gbif.service';
import { GbifController } from './gbif.controller';

@Module({
  controllers: [GbifController],
  providers: [GbifService],
  exports: [GbifService],
})
export class GbifModule {}
