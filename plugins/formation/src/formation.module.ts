import { Module } from '@nestjs/common';
import { FormationController } from './formation.controller';
import { FormationService } from './formation.service';

@Module({
  controllers: [FormationController],
  providers: [FormationService],
  exports: [FormationService],
})
export class FormationModule {
}
