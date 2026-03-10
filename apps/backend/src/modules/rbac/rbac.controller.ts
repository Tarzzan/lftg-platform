// @ts-nocheck
import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacService } from './rbac.service';
import { CreateRoleDto, CreatePermissionDto, RoleResponseDto, PermissionResponseDto } from './dto/rbac.dto';

@ApiTags('RBAC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @ApiOperation({ summary: "Liste tous les rôles avec leurs permissions" })
  @ApiResponse({ status: 200, type: [RoleResponseDto] })
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get("roles/:id")
  @ApiOperation({ summary: "Détail d\'un rôle" })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  findRole(@Param('id') id: string) {
    return this.rbacService.findRoleById(id);
  }

  @Post('roles')
  @ApiOperation({ summary: "Créer un nouveau rôle" })
  @ApiResponse({ status: 201, type: RoleResponseDto })
  createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Delete("roles/:id")
  @ApiOperation({ summary: "Supprimer un rôle" })
  deleteRole(@Param("id") id: string) {
    return this.rbacService.deleteRole(id);
  }

  @Get('permissions')
  @ApiOperation({ summary: "Liste toutes les permissions disponibles" })
  @ApiResponse({ status: 200, type: [PermissionResponseDto] })
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Post("permissions")
  @ApiOperation({ summary: "Créer une nouvelle permission" })
  @ApiResponse({ status: 201, type: PermissionResponseDto })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  @Get("users/:userId/permissions")
  @ApiOperation({ summary: "Permissions effectives d\'un utilisateur" })
  getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }
}
