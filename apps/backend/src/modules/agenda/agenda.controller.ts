// @ts-nocheck
import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AgendaService, AgendaEventDto } from './agenda.service';

@ApiTags('Agenda')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  @ApiOperation({ summary: "Lister les événements de l'agenda" })
  async getEvents(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('animalId') animalId?: string,
  ) {
    return this.agendaService.getEvents({ startDate, endDate, type, assignedToId, animalId });
  }

  @Get('export/ical')
  @ApiOperation({ summary: "Exporter l'agenda au format iCal (.ics)" })
  async exportICal(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    const ical = await this.agendaService.exportToICal({ startDate, endDate, userId });
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="lftg-agenda.ics"");
    res.send(ical);
  }

  @Get('reminders')
  @ApiOperation({ summary: "Récupérer les rappels à venir" })
  async getReminders(@Query('minutesAhead') minutesAhead?: string) {
    return this.agendaService.getUpcomingReminders(minutesAhead ? parseInt(minutesAhead) : 60);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un événement" })
  async getEvent(@Param('id') id: string) {
    return this.agendaService.getEventById(id);
  }

  @Post()
  @ApiOperation({ summary: "Créer un événement" })
  async createEvent(@Body() dto: AgendaEventDto, @Request() req: any) {
    return this.agendaService.createEvent(dto, req.user.id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Modifier un événement" })
  async updateEvent(@Param('id') id: string, @Body() dto: Partial<AgendaEventDto>) {
    return this.agendaService.updateEvent(id, dto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: "Marquer un événement comme complété" })
  async completeEvent(@Param('id') id: string, @Body('notes') notes?: string) {
    return this.agendaService.completeEvent(id, notes);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer un événement" })
  async deleteEvent(@Param("id") id: string) {
    return this.agendaService.deleteEvent(id);
  }
}
