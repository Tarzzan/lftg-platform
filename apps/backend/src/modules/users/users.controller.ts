import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les utilisateurs' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findById(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un utilisateur (nom, email, mot de passe, statut, rôles)' })
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string; password?: string; isActive?: boolean; roleIds?: string[] },
  ) {
    return this.service.update(id, body);
  }

  @Post(':id/roles')
  @ApiOperation({ summary: 'Assigne des rôles à un utilisateur' })
  assignRoles(@Param('id') id: string, @Body() body: { roleIds: string[] }) {
    return this.service.assignRoles(id, body.roleIds);
  }
}
