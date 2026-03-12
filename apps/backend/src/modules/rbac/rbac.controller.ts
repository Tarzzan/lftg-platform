import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacService } from './rbac.service';
import {
  CreateRoleDto,
  CreatePermissionDto,
  SetPermissionsDto,
  RoleResponseDto,
  PermissionResponseDto,
} from './dto/rbac.dto';

@ApiTags('RBAC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ─── Rôles ────────────────────────────────────────────────────────────────

  @Get('roles')
  @ApiOperation({ summary: 'Liste tous les rôles avec leurs permissions' })
  @ApiResponse({ status: 200, type: [RoleResponseDto] })
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: "Détail d'un rôle" })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  findRole(@Param('id') id: string) {
    return this.rbacService.findRoleById(id);
  }

  @Post('roles')
  @ApiOperation({ summary: 'Créer un nouveau rôle' })
  @ApiResponse({ status: 201, type: RoleResponseDto })
  createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Supprimer un rôle' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  // ─── Gestion des permissions d'un rôle ───────────────────────────────────

  @Put('roles/:id/permissions')
  @ApiOperation({
    summary: 'Remplacer toutes les permissions d\'un rôle',
    description: 'Remplace l\'ensemble des permissions du rôle par la liste fournie. Opération idempotente.',
  })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  setPermissions(@Param('id') id: string, @Body() dto: SetPermissionsDto) {
    return this.rbacService.setPermissions(id, dto);
  }

  @Post('roles/:id/permissions/:permissionId')
  @ApiOperation({ summary: 'Ajouter une permission à un rôle' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  addPermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rbacService.addPermission(id, permissionId);
  }

  @Delete('roles/:id/permissions/:permissionId')
  @ApiOperation({ summary: 'Retirer une permission d\'un rôle' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  removePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rbacService.removePermission(id, permissionId);
  }

  @Post('roles/:id/permissions/:permissionId/toggle')
  @ApiOperation({
    summary: 'Basculer une permission sur un rôle',
    description: 'Ajoute la permission si le rôle ne l\'a pas, la retire sinon. Retourne le rôle mis à jour avec le champ `toggled`.',
  })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  togglePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rbacService.togglePermission(id, permissionId);
  }

  // ─── Permissions ──────────────────────────────────────────────────────────

  @Get('permissions')
  @ApiOperation({ summary: 'Liste toutes les permissions disponibles (triées par ressource puis action)' })
  @ApiResponse({ status: 200, type: [PermissionResponseDto] })
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Post('permissions')
  @ApiOperation({ summary: 'Créer une nouvelle permission' })
  @ApiResponse({ status: 201, type: PermissionResponseDto })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  // ─── Utilisateurs ─────────────────────────────────────────────────────────

  @Get('users/:userId/permissions')
  @ApiOperation({ summary: "Permissions effectives d'un utilisateur (union de tous ses rôles)" })
  getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }
}
