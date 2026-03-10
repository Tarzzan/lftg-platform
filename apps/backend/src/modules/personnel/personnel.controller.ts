import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PersonnelService } from './personnel.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Personnel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('personnel')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Get('employees')
  @ApiOperation({ summary: "Lister les employés avec filtres' })
  getEmployees(
    @Query("departement') departement?: string,
    @Query('typeContrat') typeContrat?: string,
    @Query('search') search?: string,
  ) {
    return this.personnelService.getEmployees({ departement, typeContrat, search });
  }

  @Get('employees/:id')
  @ApiOperation({ summary: "Obtenir un employé par ID' })
  getEmployee(@Param("id') id: string) {
    return this.personnelService.getEmployee(id);
  }

  @Post('employees')
  @ApiOperation({ summary: "Créer un employé' })
  createEmployee(@Body() data: any) {
    return this.personnelService.createEmployee(data);
  }

  @Put("employees/:id')
  @ApiOperation({ summary: "Mettre à jour un employé' })
  updateEmployee(@Param("id') id: string, @Body() data: any) {
    return this.personnelService.updateEmployee(id, data);
  }

  @Get('planning')
  @ApiOperation({ summary: "Planning des gardes du mois' })
  getGuardSchedule(
    @Query("month') month: string = String(new Date().getMonth() + 1),
    @Query('year') year: string = String(new Date().getFullYear()),
  ) {
    return this.personnelService.getGuardSchedule(parseInt(month), parseInt(year));
  }

  @Post('planning')
  @ApiOperation({ summary: "Créer un créneau de garde' })
  createGuardShift(@Body() data: any) {
    return this.personnelService.createGuardShift(data);
  }

  @Get("conges')
  @ApiOperation({ summary: "Lister les demandes de congés' })
  getLeaveRequests(
    @Query("employeeId') employeeId?: string,
    @Query('statut') statut?: string,
  ) {
    return this.personnelService.getLeaveRequests({ employeeId, statut });
  }

  @Post('conges')
  @ApiOperation({ summary: "Créer une demande de congé' })
  createLeaveRequest(@Body() data: any) {
    return this.personnelService.createLeaveRequest(data);
  }

  @Put("conges/:id/approve')
  @ApiOperation({ summary: "Approuver une demande de congé' })
  approveLeave(@Param("id') id: string, @Body() body: { approbateurId: string }) {
    return this.personnelService.approveLeaveRequest(id, body.approbateurId);
  }

  @Put('conges/:id/refuse')
  @ApiOperation({ summary: "Refuser une demande de congé' })
  refuseLeave(@Param("id') id: string, @Body() body: { commentaire: string }) {
    return this.personnelService.refuseLeaveRequest(id, body.commentaire);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques RH globales' })
  getHRStats() {
    return this.personnelService.getHRStats();
  }
}
