import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../../../apps/backend/src/common/guards/jwt-auth.guard';
import { Public } from '../../../apps/backend/src/common/decorators/public.decorator';

@ApiTags('Plugin: Contact')
@UseGuards(JwtAuthGuard)
@Controller('plugins/contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  // ─── ENDPOINTS PUBLICS (sans authentification) ──────────────────────────────

  @Public()
  @Post('messages')
  @ApiOperation({ summary: 'Envoyer un message de contact (public)' })
  createMessage(@Body() body: {
    senderName: string;
    senderEmail: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    return this.service.createMessage(body);
  }

  // ─── ENDPOINTS ADMIN (authentification requise) ─────────────────────────────

  @ApiBearerAuth()
  @Get('messages')
  @ApiOperation({ summary: 'Lister tous les messages de contact (admin)' })
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @ApiBearerAuth()
  @Get('messages/stats')
  @ApiOperation({ summary: 'Statistiques des messages de contact (admin)' })
  getStats() {
    return this.service.getStats();
  }

  @ApiBearerAuth()
  @Get('messages/:id')
  @ApiOperation({ summary: 'Récupérer un message de contact (admin)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Patch('messages/:id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un message (admin)' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateStatus(id, body.status);
  }

  @ApiBearerAuth()
  @Post('messages/:id/replies')
  @ApiOperation({ summary: 'Répondre à un message de contact (admin)' })
  addReply(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Request() req: any,
  ) {
    return this.service.addReply(id, req.user.id, body.content);
  }

  @ApiBearerAuth()
  @Delete('messages/:id')
  @ApiOperation({ summary: 'Supprimer un message de contact (admin)' })
  deleteMessage(@Param('id') id: string) {
    return this.service.deleteMessage(id);
  }
}
