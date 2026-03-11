// @ts-nocheck
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { ContactMessagesService } from "./contact-messages.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("contact-messages")
@Controller("contact-messages")
export class ContactMessagesController {
  constructor(private readonly service: ContactMessagesService) {}

  @Post()
  @ApiOperation({ summary: "Soumettre un message de contact (public)" })
  @ApiResponse({ status: 201, description: "Message créé avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  create(@Body() body: any) { return this.service.create(body); }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lister tous les messages de contact (admin)" })
  @ApiQuery({ name: "status", required: false, description: "Filtrer par statut (UNREAD, REPLIED, ARCHIVED)" })
  @ApiResponse({ status: 200, description: "Liste des messages" })
  findAll(@Query("status") status?: string) { return this.service.findAll(status); }

  @Get("stats")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Statistiques des messages de contact" })
  @ApiResponse({ status: 200, description: "Statistiques (total, unread, replied, archived)" })
  getStats() { return this.service.getStats(); }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Détail d'un message de contact" })
  @ApiParam({ name: "id", description: "ID du message" })
  @ApiResponse({ status: 200, description: "Détail du message avec ses réponses" })
  @ApiResponse({ status: 404, description: "Message non trouvé" })
  findOne(@Param("id") id: string) { return this.service.findOne(id); }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour le statut d'un message" })
  @ApiParam({ name: "id", description: "ID du message" })
  @ApiResponse({ status: 200, description: "Statut mis à jour" })
  updateStatus(@Param("id") id: string, @Body("status") status: string) { return this.service.updateStatus(id, status); }

  @Post(":id/reply")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Répondre à un message de contact" })
  @ApiParam({ name: "id", description: "ID du message" })
  @ApiResponse({ status: 201, description: "Réponse envoyée" })
  reply(@Param("id") id: string, @Body() body: any) { return this.service.reply(id, body); }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer un message de contact" })
  @ApiParam({ name: "id", description: "ID du message" })
  @ApiResponse({ status: 200, description: "Message supprimé" })
  remove(@Param("id") id: string) { return this.service.remove(id); }
}
