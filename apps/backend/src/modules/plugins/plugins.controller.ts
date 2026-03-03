import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PluginRegistryService } from './plugin-registry.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Plugins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plugins')
export class PluginsController {
  constructor(private registry: PluginRegistryService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les plugins enregistrés' })
  findAll() {
    return this.registry.getAllPlugins();
  }

  @Get('menu')
  @ApiOperation({ summary: 'Retourne les entrées de menu pour l\'utilisateur connecté' })
  getMenu() {
    return this.registry.getMenuEntries([]);
  }
}
