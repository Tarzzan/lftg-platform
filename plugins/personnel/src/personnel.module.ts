import { Module, OnModuleInit } from '@nestjs/common';
import { PersonnelController } from './personnel.controller';
import { PersonnelService } from './personnel.service';
import { PluginRegistryService } from '../../../apps/backend/src/modules/plugins/plugin-registry.service';
import { personnelManifest } from './manifest';

@Module({
  controllers: [PersonnelController],
  providers: [PersonnelService],
  exports: [PersonnelService],
})
export class PersonnelModule implements OnModuleInit {
  constructor(private registry: PluginRegistryService) {}
  onModuleInit() {
    this.registry.registerPlugin(personnelManifest);
  }
}
