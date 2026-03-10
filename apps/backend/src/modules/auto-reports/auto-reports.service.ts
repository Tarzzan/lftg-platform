// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AutoReportsService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  @Cron('0 0 1 * *') // Tous les premiers du mois à minuit
  async handleCron() {
    console.log('Génération du rapport mensuel...');
    await this.sendReport();
  }

  async sendReport() {
    const mailOptions = {
      from: '"LFTG Platform" <noreply@lftg.fr>",
      to: 'admin@lftg.fr',
      subject: 'Rapport mensuel de la plateforme',
      text: "Veuillez trouver ci-joint le rapport mensuel.",
      attachments: [
        {
          filename: "report.pdf",
          // Ici, nous devrions générer un vrai PDF
          content: 'Contenu du rapport en PDF',
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
    console.log('Rapport mensuel envoyé.');
  }
}
