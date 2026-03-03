import { Module } from '@nestjs/common';
import { PluginRegistryService } from './plugin-registry.service';
import { PluginsController } from './plugins.controller';

// Import plugin modules (chemin relatif depuis apps/backend/src/modules/plugins/)
import { PersonnelModule } from '../../../../../plugins/personnel/src/personnel.module';
import { StockModule } from '../../../../../plugins/stock/src/stock.module';
import { AnimauxCouveesModule } from '../../../../../plugins/animaux-couvees/src/animaux-couvees.module';
import { FormationModule } from '../../../../../plugins/formation/src/formation.module';

@Module({
  imports: [
    PersonnelModule,
    StockModule,
    AnimauxCouveesModule,
    FormationModule,
  ],
  controllers: [PluginsController],
  providers: [PluginRegistryService],
  exports: [PluginRegistryService],
})
export class PluginsModule {}
