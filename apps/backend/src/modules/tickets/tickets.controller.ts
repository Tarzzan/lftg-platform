// @ts-nocheck
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TicketsService, CreateTicketDto, TicketStatus, TicketPriority, TicketCategory } from './tickets.service';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: "Lister les tickets" })
  findAll(
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
    @Query('category') category?: TicketCategory,
  ) {
    return this.ticketsService.findAll({ status, priority, category });
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un ticket" })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Créer un ticket" })
  create(@CurrentUser() user: any, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(user.id, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Mettre à jour un ticket" })
  update(@Param('id') id: string, @Body() data: any) {
    return this.ticketsService.update(id, data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: "Mettre à jour le statut d'un ticket" })
  updateStatus(@Param('id') id: string, @Body('status') status: TicketStatus) {
    return this.ticketsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer un ticket" })
  delete(@Param('id') id: string) {
    return this.ticketsService.delete(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: "Ajouter un commentaire à un ticket" })
  addComment(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body('content') content: string,
  ) {
    return this.ticketsService.addComment(id, user.id, content);
  }
}
