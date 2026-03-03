import { Module } from '@nestjs/common';
import { AnimauxCouveesController } from './animaux-couvees.controller';
import { AnimauxCouveesService } from './animaux-couvees.service';

@Module({
  controllers: [AnimauxCouveesController],
  providers: [AnimauxCouveesService],
  exports: [AnimauxCouveesService],
})
export class AnimauxCouveesModule {
}
