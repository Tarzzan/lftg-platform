import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Controller, Post, Body, UseGuards} from '@nestjs/common';
import { FcmService } from './fcm.service';

@UseGuards(JwtAuthGuard)
@@Controller('fcm')
export class FcmController {
  constructor(private readonly fcmService: FcmService) {}

  @Post('send')
  async sendNotification(
    @Body('token') token: string,
    @Body('title') title: string,
    @Body('body') body: string,
  ) {
    return this.fcmService.sendPushNotification(token, title, body);
  }
}
