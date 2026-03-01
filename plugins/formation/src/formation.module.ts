import { Module, OnModuleInit } from '@nestjs/common';
import { FormationController } from './formation.controller';
import { FormationService } from './formation.service';
import { PluginRegistryService } from '../../../apps/backend/src/modules/plugins/plugin-registry.service';
import { formationManifest } from './manifest';

@Module({
  controllers: [FormationController],
  providers: [FormationService],
  exports: [FormationService],
})
export class FormationModule implements OnModuleInit {
  constructor(private registry: PluginRegistryService) {}
  onModuleInit() {
    this.registry.registerPlugin(formationManifest);
  }
}
