import { Injectable, Logger } from '@nestjs/common';

export interface SmsAlert {
  to: string;
  type: 'STOCK_CRITICAL' | 'MEDICAL_URGENT' | 'SECURITY' | 'CUSTOM';
  message: string;
  priority: 'HIGH' | 'CRITICAL';
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendAlert(alert: SmsAlert) {
    // In production: use Twilio SDK
    // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({ body: alert.message, from: process.env.TWILIO_FROM, to: alert.to });

    this.logger.log(`[SMS] Sending ${alert.type} alert to ${alert.to}: ${alert.message}`);
    return {
      success: true,
      messageId: `sms-${Date.now()}`,
      to: alert.to,
      type: alert.type,
      sentAt: new Date().toISOString(),
    };
  }

  async sendBulk(alerts: SmsAlert[]) {
    const results = await Promise.all(alerts.map(a => this.sendAlert(a)));
    return { sent: results.length, results };
  }

  async getAlertHistory() {
    return [
      { id: 'sms-1', type: 'STOCK_CRITICAL', to: '+594XXXXXXXX', message: "LFTG ALERTE: Stock graines tournesol critique (2kg restants)", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: "DELIVERED" },
      { id: 'sms-2', type: 'MEDICAL_URGENT', to: '+594XXXXXXXX', message: "LFTG URGENT: Dendrobate en observation - Dr. Rousseau requis", sentAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), status: "DELIVERED" },
      { id: 'sms-3', type: 'SECURITY', to: '+594XXXXXXXX', message: "LFTG SECURITE: Serrure Volière A défectueuse - intervention requise", sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: "DELIVERED" },
    ];
  }
}
