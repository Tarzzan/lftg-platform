import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PushService, PushSubscriptionDto } from './push.service';

@ApiTags('Push Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('vapid-public-key')
  @ApiOperation({ summary: 'Récupérer la clé publique VAPID pour le service worker' })
  getVapidPublicKey() {
    return { publicKey: this.pushService.getVapidPublicKey() };
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'S\'abonner aux notifications push' })
  async subscribe(@Body() dto: PushSubscriptionDto, @Request() req: any) {
    return this.pushService.subscribe({ ...dto, userId: req.user.id });
  }

  @Delete('unsubscribe')
  @ApiOperation({ summary: 'Se désabonner des notifications push' })
  async unsubscribe(@Body('endpoint') endpoint: string) {
    return this.pushService.unsubscribe(endpoint);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Lister ses abonnements push actifs' })
  async getSubscriptions(@Request() req: any) {
    return this.pushService.getUserSubscriptions(req.user.id);
  }

  @Post('test')
  @ApiOperation({ summary: 'Envoyer une notification push de test' })
  async sendTest(@Request() req: any) {
    return this.pushService.sendToUser(req.user.id, {
      title: '🦜 Test LFTG Platform',
      body: 'Les notifications push fonctionnent correctement !',
      url: '/admin',
      tag: 'test',
    });
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Diffuser une notification à tous les utilisateurs (admin)' })
  async broadcast(@Body() body: { title: string; body: string; url?: string; roles?: string[] }) {
    return this.pushService.broadcast({
      title: body.title,
      body: body.body,
      url: body.url,
      icon: '/icons/icon-192x192.png',
    }, body.roles);
  }
}
