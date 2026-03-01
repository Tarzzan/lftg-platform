import { Module, OnModuleInit } from '@nestjs/common';
import { AnimauxCouveesController } from './animaux-couvees.controller';
import { AnimauxCouveesService } from './animaux-couvees.service';
import { PluginRegistryService } from '../../../apps/backend/src/modules/plugins/plugin-registry.service';
import { animauxCouveesManifest } from './manifest';

@Module({
  controllers: [AnimauxCouveesController],
  providers: [AnimauxCouveesService],
  exports: [AnimauxCouveesService],
})
export class AnimauxCouveesModule implements OnModuleInit {
  constructor(private registry: PluginRegistryService) {}
  onModuleInit() {
    this.registry.registerPlugin(animauxCouveesManifest);
  }
}
