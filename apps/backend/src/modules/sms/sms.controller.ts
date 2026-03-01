import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SmsService, SmsAlert } from './sms.service';

@ApiTags('SMS Alertes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Envoyer une alerte SMS' })
  sendAlert(@Body() alert: SmsAlert) {
    return this.smsService.sendAlert(alert);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Envoyer des alertes SMS en masse' })
  sendBulk(@Body() alerts: SmsAlert[]) {
    return this.smsService.sendBulk(alerts);
  }

  @Get('history')
  @ApiOperation({ summary: 'Historique des SMS envoyés' })
  getHistory() {
    return this.smsService.getAlertHistory();
  }
}
