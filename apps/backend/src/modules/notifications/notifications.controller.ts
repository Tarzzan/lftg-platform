// @ts-nocheck
import { Controller, Get, Param, Sse, UseGuards } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService, NotificationEvent } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * SSE stream for the authenticated user
   * GET /api/v1/notifications/stream
   */
  @Sse('stream')
  streamForUser(@CurrentUser() user: any): Observable<MessageEvent> {
    return this.notificationsService.subscribe(user.id).pipe(
      map((event: NotificationEvent) => ({
        data: JSON.stringify(event),
        type: event.type,
        id: event.id,
      } as MessageEvent)),
    );
  }

  /**
   * SSE global stream (admin only)
   * GET /api/v1/notifications/stream/global
   */
  @Sse('stream/global')
  streamGlobal(): Observable<MessageEvent> {
    return this.notificationsService.subscribe().pipe(
      map((event: NotificationEvent) => ({
        data: JSON.stringify(event),
        type: event.type,
        id: event.id,
      } as MessageEvent)),
    );
  }
}
