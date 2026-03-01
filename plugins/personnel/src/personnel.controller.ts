import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PersonnelService } from './personnel.service';
import { JwtAuthGuard } from '../../../apps/backend/src/common/guards/jwt-auth.guard';

@ApiTags('Plugin: Personnel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plugins/personnel')
export class PersonnelController {
  constructor(private service: PersonnelService) {}

  @Get('employees')
  @ApiOperation({ summary: 'Liste tous les employés' })
  findAll() { return this.service.findAllEmployees(); }

  @Get('employees/:id')
  findOne(@Param('id') id: string) { return this.service.findEmployeeById(id); }

  @Post('employees')
  @ApiOperation({ summary: 'Crée un nouvel employé' })
  create(@Body() body: { userId: string; jobTitle?: string; department?: string }) {
    return this.service.createEmployee(body);
  }

  @Patch('employees/:id')
  update(@Param('id') id: string, @Body() body: { jobTitle?: string; department?: string }) {
    return this.service.updateEmployee(id, body);
  }

  @Post('employees/:id/skills')
  @ApiOperation({ summary: 'Ajoute une compétence à un employé' })
  addSkill(@Param('id') id: string, @Body() body: { skillName: string }) {
    return this.service.addSkill(id, body.skillName);
  }

  @Get('skills')
  @ApiOperation({ summary: 'Liste toutes les compétences' })
  findAllSkills() { return this.service.findAllSkills(); }
}
