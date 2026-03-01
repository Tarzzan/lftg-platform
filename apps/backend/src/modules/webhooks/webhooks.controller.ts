import { Controller, Post, Body } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('send')
  async sendWebhook(@Body('url') url: string, @Body('payload') payload: any) {
    return this.webhooksService.sendWebhook(url, payload);
  }
}
