import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private service: RolesService) {}

  // ─── Rôles ────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Liste tous les rôles avec leurs permissions' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un rôle" })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un nouveau rôle' })
  create(@Body() body: { name: string; description?: string }) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour le nom ou la description d\'un rôle' })
  update(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprime un rôle' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // ─── Gestion des permissions d'un rôle ───────────────────────────────────

  @Post(':id/permissions')
  @ApiOperation({
    summary: 'Ajoute des permissions à un rôle (par objets action+subject)',
    description: 'Crée les permissions si elles n\'existent pas. N\'efface pas les permissions existantes.',
  })
  addPermissions(
    @Param('id') id: string,
    @Body() body: { permissions: { action: string; subject: string }[] },
  ) {
    return this.service.addPermissions(id, body.permissions);
  }

  @Put(':id/permissions')
  @ApiOperation({
    summary: 'Remplace toutes les permissions d\'un rôle par la liste d\'IDs fournie',
    description: 'Opération idempotente. Utilisé par la matrice RBAC pour synchroniser l\'état complet.',
  })
  setPermissions(
    @Param('id') id: string,
    @Body() body: { permissionIds: string[] },
  ) {
    return this.service.setPermissions(id, body.permissionIds);
  }

  @Post(':id/permissions/:permissionId/toggle')
  @ApiOperation({
    summary: 'Bascule une permission sur un rôle',
    description: 'Ajoute la permission si le rôle ne l\'a pas, la retire sinon. Retourne le rôle mis à jour avec `toggled`.',
  })
  @ApiResponse({ status: 200, description: 'Rôle mis à jour avec toggled: "added" | "removed"' })
  togglePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.service.togglePermission(id, permissionId);
  }

  @Post(':id/permissions/:permissionId')
  @ApiOperation({ summary: 'Ajoute une permission à un rôle par son ID' })
  addPermissionById(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.service.addPermissionById(id, permissionId);
  }

  @Delete(':id/permissions/:permissionId')
  @ApiOperation({ summary: 'Retire une permission d\'un rôle par son ID' })
  removePermissionById(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.service.removePermissionById(id, permissionId);
  }

  // ─── Permissions globales ─────────────────────────────────────────────────

  @Get('permissions/all')
  @ApiOperation({ summary: 'Liste toutes les permissions disponibles (triées par ressource puis action)' })
  findAllPermissions() {
    return this.service.findAllPermissions();
  }

  @Post('permissions/create')
  @ApiOperation({ summary: 'Crée une nouvelle permission' })
  createPermission(@Body() body: { action: string; subject: string; description?: string }) {
    return this.service.createPermission(body);
  }
}
