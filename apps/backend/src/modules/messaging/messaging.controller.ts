// @ts-nocheck
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MessagingService, CreateConversationDto, SendMessageDto } from './messaging.service';

@ApiTags('Messagerie')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  @ApiOperation({ summary: "Lister les conversations" })
  getConversations(@CurrentUser() user: any) {
    return this.messagingService.getConversations(user.id);
  }

  @Post('conversations')
  @ApiOperation({ summary: "Créer une conversation" })
  createConversation(@CurrentUser() user: any, @Body() dto: CreateConversationDto) {
    return this.messagingService.createConversation(user.id, dto);
  }

  @Get("conversations/:id/messages")
  @ApiOperation({ summary: "Récupérer les messages d'une conversation" })
  getMessages(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.messagingService.getMessages(id, +page, +limit);
  }

  @Post('messages')
  @ApiOperation({ summary: "Envoyer un message" })
  sendMessage(@CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.messagingService.sendMessage(user.id, dto);
  }

  @Post("conversations/:id/read")
  @ApiOperation({ summary: "Marquer une conversation comme lue" })
  markAsRead(@Param("id") id: string, @CurrentUser() user: any) {
    return this.messagingService.markAsRead(id, user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Nombre de messages non lus' })
  getUnreadCount(@CurrentUser() user: any) {
    return this.messagingService.getUnreadCount(user.id);
  }
}
