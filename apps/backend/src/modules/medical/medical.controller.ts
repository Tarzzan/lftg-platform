// @ts-nocheck
import {
  Controller, Get, Post, Put, Delete, Patch,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { MedicalService } from './medical.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('medical')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MedicalController {
  constructor(private readonly medicalService: MedicalService) {}

  // ─── Dashboard médical ───────────────────────────────────────────────────

  @Get('dashboard')
  @Permissions('medical:read')
  getDashboard() {
    return this.medicalService.getMedicalDashboard();
  }

  // ─── Visites ─────────────────────────────────────────────────────────────

  @Get('visits')
  @Permissions('medical:read')
  findAllVisits(
    @Query('animalId') animalId?: string,
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('vetName') vetName?: string,
  ) {
    return this.medicalService.findAllVisits(animalId, { type, dateFrom, dateTo, vetName });
  }

  @Get('visits/:id')
  @Permissions('medical:read')
  findVisitById(@Param('id') id: string) {
    return this.medicalService.findVisitById(id);
  }

  @Post('visits')
  @Permissions('medical:write')
  createVisit(@Body() dto: {
    animalId: string;
    type: string;
    visitDate: string;
    vetName: string;
    diagnosis?: string;
    notes?: string;
    weight?: number;
    temperature?: number;
    nextVisitDate?: string;
  }) {
    return this.medicalService.createVisit(dto);
  }

  @Put('visits/:id')
  @Permissions('medical:write')
  updateVisit(@Param('id') id: string, @Body() dto: any) {
    return this.medicalService.updateVisit(id, dto);
  }

  @Delete('visits/:id')
  @Permissions('medical:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteVisit(@Param('id') id: string) {
    return this.medicalService.deleteVisit(id);
  }

  // ─── Historique animal ───────────────────────────────────────────────────

  @Get('animals/:animalId/history')
  @Permissions('medical:read')
  getAnimalHistory(@Param('animalId') animalId: string) {
    return this.medicalService.getAnimalMedicalHistory(animalId);
  }

  // ─── Traitements ─────────────────────────────────────────────────────────

  @Post('visits/:visitId/treatments')
  @Permissions('medical:write')
  addTreatment(@Param('visitId') visitId: string, @Body() dto: {
    name: string;
    dosage?: string;
    frequency?: string;
    startDate: string;
    endDate?: string;
    notes?: string;
  }) {
    return this.medicalService.addTreatment(visitId, dto);
  }

  @Patch('treatments/:id')
  @Permissions('medical:write')
  updateTreatment(@Param('id') id: string, @Body() dto: any) {
    return this.medicalService.updateTreatment(id, dto);
  }

  @Delete('treatments/:id')
  @Permissions('medical:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTreatment(@Param('id') id: string) {
    return this.medicalService.deleteTreatment(id);
  }

  // ─── Vaccinations ─────────────────────────────────────────────────────────

  @Post('visits/:visitId/vaccinations')
  @Permissions('medical:write')
  addVaccination(@Param('visitId') visitId: string, @Body() dto: {
    vaccine: string;
    batchNumber?: string;
    administeredDate: string;
    nextDueDate?: string;
    notes?: string;
  }) {
    return this.medicalService.addVaccination(visitId, dto);
  }
}
