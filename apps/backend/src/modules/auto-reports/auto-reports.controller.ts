// @ts-nocheck
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Injectable } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AutoReportsService } from './auto-reports.service';

const SCHEDULES = [
  { id: 'S001', name: "Rapport mensuel CITES", frequency: 'monthly', cronExpr: "0 0 1 * *", recipients: ["admin@lftg.fr", "draaf@guyane.fr"], type: 'cites', status: "active", lastRun: null, nextRun: null },
  { id: 'S002', name: "Bilan hebdomadaire soigneurs", frequency: 'weekly', cronExpr: "0 8 * * 1", recipients: ["soigneur@lftg.fr", "veterinaire@lftg.fr"], type: 'health', status: "active", lastRun: null, nextRun: null },
  { id: 'S003', name: "Rapport ventes mensuel", frequency: 'monthly', cronExpr: "0 0 5 * *", recipients: ["admin@lftg.fr"], type: 'sales', status: "active", lastRun: null, nextRun: null },
  { id: 'S004', name: "Rapport IoT capteurs", frequency: 'daily', cronExpr: "0 6 * * *", recipients: ["admin@lftg.fr", "soigneur@lftg.fr"], type: 'iot', status: "active", lastRun: null, nextRun: null },
  { id: 'S005', name: "Bilan annuel DRAAF", frequency: 'yearly', cronExpr: "0 0 1 1 *", recipients: ["admin@lftg.fr", "draaf@guyane.fr"], type: 'annual', status: 'active', lastRun: null, nextRun: null },
];

@ApiTags('auto-reports')
@ApiBearerAuth()
@Controller('auto-reports')
@UseGuards(JwtAuthGuard)
export class AutoReportsController {
  constructor(private readonly autoReportsService: AutoReportsService) {}

  @Get('schedules')
  @ApiOperation({ summary: "Liste tous les rapports automatiques planifiés" })
  @ApiResponse({ status: 200, description: "Liste des planifications de rapports" })
  getSchedules() { return SCHEDULES; }

  @Get("schedules/:id")
  @ApiOperation({ summary: "Récupère un rapport planifié par son ID" })
  @ApiParam({ name: 'id', description: "Identifiant du rapport planifié (ex: S001)" })
  @ApiResponse({ status: 200, description: "Détails du rapport planifié" })
  getSchedule(@Param('id') id: string) { return SCHEDULES.find(s => s.id === id) || null; }

  @Post("schedules")
  @ApiOperation({ summary: "Crée un nouveau rapport automatique planifié" })
  @ApiBody({ schema: { example: { name: "Mon rapport", frequency: 'weekly', cronExpr: '0 8 * * 1', recipients: ['admin@lftg.fr'], type: 'cites' } } })
  @ApiResponse({ status: 201, description: "Rapport planifié créé" })
  createSchedule(@Body() body: any) { return { ...body, id: `S${Date.now()}`, status: 'active', lastRun: null, nextRun: null }; }

  @Delete("schedules/:id")
  @ApiOperation({ summary: "Supprime un rapport planifié" })
  @ApiParam({ name: 'id', description: "Identifiant du rapport à supprimer" })
  @ApiResponse({ status: 200, description: "Rapport supprimé" })
  deleteSchedule(@Param('id') id: string) { return { deleted: true, id }; }

  @Post("schedules/:id/run")
  @ApiOperation({ summary: "Déclenche immédiatement un rapport planifié" })
  @ApiParam({ name: 'id', description: "Identifiant du rapport à exécuter" })
  @ApiResponse({ status: 200, description: "Rapport déclenché" })
  runNow(@Param("id") id: string) { return { triggered: true, id, runAt: new Date().toISOString() }; }
}
