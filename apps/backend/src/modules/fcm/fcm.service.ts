import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  async sendPushNotification(token: string, title: string, body: string): Promise<string> {
    const message = {
      notification: { title, body },
      token,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:", response);
      return response;
    } catch (error) {
      console.error('Error sending message:", error);
      throw error;
    }
  }
}
