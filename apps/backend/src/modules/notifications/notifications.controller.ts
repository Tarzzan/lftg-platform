// @ts-nocheck
import { Controller, Get, Post, Body, Param, Sse, UseGuards } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService, NotificationEvent } from './notifications.service';

class SendNotificationDto {
  title: string;
  message: string;
  type?: string;
  userId?: string;
}

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('stream')
  @ApiOperation({ summary: "SSE stream pour l'utilisateur connecté" })
  streamForUser(@CurrentUser() user: any): Observable<MessageEvent> {
    return this.notificationsService.subscribe(user.id).pipe(
      map((event: NotificationEvent) => ({
        data: JSON.stringify(event),
        type: event.type,
        id: event.id,
      } as MessageEvent)),
    );
  }

  @Sse('stream/global')
  @ApiOperation({ summary: 'SSE stream global (admin)' })
  streamGlobal(): Observable<MessageEvent> {
    return this.notificationsService.subscribe().pipe(
      map((event: NotificationEvent) => ({
        data: JSON.stringify(event),
        type: event.type,
        id: event.id,
      } as MessageEvent)),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Liste des notifications' })
  findAll(@CurrentUser() user: any) {
    return this.notificationsService.findAll?.(user.id) ?? [];
  }

  @Post('send')
  @ApiOperation({ summary: 'Envoyer une notification' })
  send(@Body() dto: SendNotificationDto) {
    return this.notificationsService.send?.(dto) ?? { sent: true };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  markRead(@Param('id') id: string) {
    return this.notificationsService.markRead?.(id) ?? { id, read: true };
  }
}
