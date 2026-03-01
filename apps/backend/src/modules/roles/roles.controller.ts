import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private service: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les rôles' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findById(id); }

  @Post()
  @ApiOperation({ summary: 'Crée un nouveau rôle' })
  create(@Body() body: { name: string; description?: string }) { return this.service.create(body); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.service.update(id, body);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Ajoute des permissions à un rôle' })
  addPermissions(
    @Param('id') id: string,
    @Body() body: { permissions: { action: string; subject: string }[] },
  ) {
    return this.service.addPermissions(id, body.permissions);
  }
}
