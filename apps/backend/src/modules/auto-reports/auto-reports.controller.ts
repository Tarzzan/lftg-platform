// @ts-nocheck
import { Controller, Get, Post, Body, Param, Delete, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

const SCHEDULES = [
  { id: "S001", name: "Rapport mensuel CITES", frequency: "monthly", cronExpr: "0 0 1 * *", recipients: ["admin@lftg.fr", "draaf@guyane.fr"], type: "cites", status: "active", lastRun: null, nextRun: null },
  { id: "S002", name: "Bilan hebdomadaire soigneurs", frequency: "weekly", cronExpr: "0 8 * * 1", recipients: ["soigneur@lftg.fr", "veterinaire@lftg.fr"], type: "health", status: "active", lastRun: null, nextRun: null },
  { id: "S003", name: "Rapport ventes mensuel", frequency: "monthly", cronExpr: "0 0 5 * *", recipients: ["admin@lftg.fr"], type: "sales", status: "active", lastRun: null, nextRun: null },
  { id: "S004", name: "Rapport IoT capteurs", frequency: "daily", cronExpr: "0 6 * * *", recipients: ["admin@lftg.fr", "soigneur@lftg.fr"], type: "iot", status: "active", lastRun: null, nextRun: null },
  { id: "S005", name: "Bilan annuel DRAAF", frequency: "yearly", cronExpr: "0 0 1 1 *", recipients: ["admin@lftg.fr", "draaf@guyane.fr"], type: "annual", status: "active", lastRun: null, nextRun: null },
];

@ApiTags('auto-reports')
@ApiBearerAuth()
@Controller("auto-reports")
@UseGuards(JwtAuthGuard)
export class AutoReportsController {
  @Get("schedules")
  getSchedules() { return SCHEDULES; }

  @Get("schedules/:id")
  getSchedule(@Param("id") id: string) { return SCHEDULES.find(s => s.id === id) || null; }

  @Post("schedules")
  createSchedule(@Body() body: any) { return { ...body, id: `S${Date.now()}`, status: "active", lastRun: null, nextRun: null }; }

  @Delete("schedules/:id")
  deleteSchedule(@Param("id") id: string) { return { deleted: true, id }; }

  @Post("schedules/:id/run")
  runNow(@Param("id") id: string) { return { triggered: true, id, runAt: new Date().toISOString() }; }
}
