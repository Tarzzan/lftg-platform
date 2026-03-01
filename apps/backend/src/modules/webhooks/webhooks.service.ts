'''
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WebhooksService {
  async sendWebhook(url: string, payload: any): Promise<void> {
    try {
      await axios.post(url, payload);
      console.log(`Webhook sent to ${url}`);
    } catch (error) {
      console.error(`Error sending webhook to ${url}:`, error);
      throw error;
    }
  }
}
'''
