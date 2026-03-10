import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PluginRegistryService } from './plugin-registry.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Plugins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plugins')
export class PluginsController {
  constructor(private registry: PluginRegistryService) {}

  @Get()
  @ApiOperation({ summary: "Liste tous les plugins enregistrés" })
  @ApiResponse({ status: 200, description: "Liste des plugins actifs" })
  findAll() {
    return this.registry.getAllPlugins();
  }

  @Get('menu')
  @ApiOperation({ summary: "Retourne les entrées de menu filtrées par rôle utilisateur" })
  @ApiQuery({ name: 'roles', required: false, type: String, description: "Rôles séparés par virgule (ex: ADMIN,VETERINAIRE)" })
  @ApiResponse({ status: 200, description: "Entrées de menu accessibles" })
  getMenu(@Query('roles') roles?: string) {
    const userRoles = roles ? roles.split(',').map(r => r.trim()) : [];
    return this.registry.getMenuEntries(userRoles);
  }

  @Get('permissions')
  @ApiOperation({ summary: "Liste toutes les permissions déclarées par les plugins" })
  @ApiResponse({ status: 200, description: "Permissions des plugins" })
  getPermissions() {
    return this.registry.getPermissions();
  }

  @Get(':id')
  @ApiOperation({ summary: "Récupère un plugin par son identifiant" })
  @ApiParam({ name: 'id', description: "Identifiant unique du plugin" })
  @ApiResponse({ status: 200, description: "Détails du plugin" })
  @ApiResponse({ status: 404, description: "Plugin non trouvé" })
  findOne(@Param("id") id: string) {
    return this.registry.getPlugin(id);
  }
}
