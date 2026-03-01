import { Module, OnModuleInit } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { PluginRegistryService } from '../../../apps/backend/src/modules/plugins/plugin-registry.service';
import { stockManifest } from './manifest';

@Module({
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule implements OnModuleInit {
  constructor(private registry: PluginRegistryService) {}
  onModuleInit() {
    this.registry.registerPlugin(stockManifest);
  }
}
