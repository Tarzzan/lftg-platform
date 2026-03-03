import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface AlertEmailData {
  type: 'stock_low' | 'medical_reminder' | 'workflow_approval' | 'brood_alert' | 'welcome';
  recipientEmail: string;
  recipientName: string;
  data: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly from: string;
  private readonly resendApiKey: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get('EMAIL_FROM', 'noreply@lftg.fr');
    this.resendApiKey = this.config.get('RESEND_API_KEY');
  }

  // ─── Envoi générique ─────────────────────────────────────────────────────

  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string }> {
    if (!this.resendApiKey) {
      this.logger.warn(`[EMAIL MOCK] To: ${payload.to} | Subject: ${payload.subject}`);
      this.logger.debug(`[EMAIL MOCK] Body: ${payload.text || payload.html.replace(/<[^>]*>/g, '')}`);
      return { success: true, id: `mock-${Date.now()}` };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: payload.from || this.from,
          to: Array.isArray(payload.to) ? payload.to : [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Email send failed: ${error}`);
        return { success: false };
      }

      const result = await response.json() as { id: string };
      this.logger.log(`Email sent successfully: ${result.id}`);
      return { success: true, id: result.id };
    } catch (error) {
      this.logger.error('Email send error:', error);
      return { success: false };
    }
  }

  // ─── Templates d'alertes ─────────────────────────────────────────────────

  async sendStockLowAlert(data: {
    recipientEmail: string;
    recipientName: string;
    articleName: string;
    currentQuantity: number;
    threshold: number;
    unit: string;
  }) {
    return this.sendEmail({
      to: data.recipientEmail,
      subject: `⚠️ Alerte stock faible — ${data.articleName}`,
      html: this.buildStockLowTemplate(data),
      text: `Alerte stock faible : ${data.articleName} (${data.currentQuantity} ${data.unit} restants, seuil : ${data.threshold} ${data.unit})`,
    });
  }

  async sendMedicalReminder(data: {
    recipientEmail: string;
    recipientName: string;
    animalName: string;
    visitType: string;
    visitDate: Date;
    vetName: string;
  }) {
    return this.sendEmail({
      to: data.recipientEmail,
      subject: `🏥 Rappel visite médicale — ${data.animalName}`,
      html: this.buildMedicalReminderTemplate(data),
      text: `Rappel : visite ${data.visitType} pour ${data.animalName} le ${data.visitDate.toLocaleDateString('fr-FR')} avec ${data.vetName}`,
    });
  }

  async sendWorkflowApprovalRequest(data: {
    recipientEmail: string;
    recipientName: string;
    workflowName: string;
    instanceId: string;
    requestedBy: string;
    description: string;
    appUrl: string;
  }) {
    return this.sendEmail({
      to: data.recipientEmail,
      subject: `✅ Approbation requise — ${data.workflowName}`,
      html: this.buildWorkflowApprovalTemplate(data),
      text: `${data.requestedBy} demande votre approbation pour : ${data.workflowName}. Accédez à ${data.appUrl}/admin/workflows/${data.instanceId}`,
    });
  }

  async sendWelcomeEmail(data: {
    recipientEmail: string;
    recipientName: string;
    temporaryPassword?: string;
    appUrl: string;
  }) {
    return this.sendEmail({
      to: data.recipientEmail,
      subject: `🦜 Bienvenue sur LFTG Platform`,
      html: this.buildWelcomeTemplate(data),
      text: `Bienvenue ${data.recipientName} sur LFTG Platform ! Connectez-vous sur ${data.appUrl}`,
    });
  }

  async sendBroodAlert(data: {
    recipientEmail: string;
    recipientName: string;
    speciesName: string;
    expectedHatchDate: Date;
    eggsCount: number;
  }) {
    return this.sendEmail({
      to: data.recipientEmail,
      subject: `🥚 Éclosion imminente — ${data.speciesName}`,
      html: this.buildBroodAlertTemplate(data),
      text: `Éclosion prévue pour ${data.eggsCount} œufs de ${data.speciesName} le ${data.expectedHatchDate.toLocaleDateString('fr-FR')}`,
    });
  }

  // ─── Templates HTML ───────────────────────────────────────────────────────

  private buildBaseTemplate(content: string, title: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0fdf4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header .emoji { font-size: 48px; display: block; margin-bottom: 12px; }
    .body { padding: 32px; }
    .body p { color: #374151; line-height: 1.6; margin: 0 0 16px; }
    .alert-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .alert-box.danger { background: #fef2f2; border-color: #ef4444; }
    .alert-box.success { background: #f0fdf4; border-color: #22c55e; }
    .btn { display: inline-block; background: #166534; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { background: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #f0fdf4; color: #166534; padding: 8px 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
    td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="emoji">🦜</span>
      <h1>LFTG Platform</h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>La Ferme Tropicale de Guyane — Système de gestion automatisé</p>
      <p>© 2026 LFTG Platform. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private buildStockLowTemplate(data: any): string {
    return this.buildBaseTemplate(`
      <p>Bonjour <strong>${data.recipientName}</strong>,</p>
      <p>Le niveau de stock de l'article suivant est en dessous du seuil d'alerte :</p>
      <div class="alert-box danger">
        <table>
          <tr><th>Article</th><td><strong>${data.articleName}</strong></td></tr>
          <tr><th>Quantité actuelle</th><td><strong style="color:#ef4444">${data.currentQuantity} ${data.unit}</strong></td></tr>
          <tr><th>Seuil d'alerte</th><td>${data.threshold} ${data.unit}</td></tr>
        </table>
      </div>
      <p>Veuillez procéder à un réapprovisionnement dès que possible.</p>
    `, `Alerte stock — ${data.articleName}`);
  }

  private buildMedicalReminderTemplate(data: any): string {
    return this.buildBaseTemplate(`
      <p>Bonjour <strong>${data.recipientName}</strong>,</p>
      <p>Un rappel de visite médicale a été programmé :</p>
      <div class="alert-box">
        <table>
          <tr><th>Animal</th><td><strong>${data.animalName}</strong></td></tr>
          <tr><th>Type de visite</th><td>${data.visitType}</td></tr>
          <tr><th>Date</th><td><strong>${data.visitDate.toLocaleDateString('fr-FR')}</strong></td></tr>
          <tr><th>Vétérinaire</th><td>${data.vetName}</td></tr>
        </table>
      </div>
    `, `Rappel visite — ${data.animalName}`);
  }

  private buildWorkflowApprovalTemplate(data: any): string {
    return this.buildBaseTemplate(`
      <p>Bonjour <strong>${data.recipientName}</strong>,</p>
      <p><strong>${data.requestedBy}</strong> a soumis une demande nécessitant votre approbation :</p>
      <div class="alert-box">
        <p><strong>Workflow :</strong> ${data.workflowName}</p>
        <p><strong>Description :</strong> ${data.description}</p>
      </div>
      <a href="${data.appUrl}/admin/workflows/${data.instanceId}" class="btn">Voir la demande</a>
    `, `Approbation requise — ${data.workflowName}`);
  }

  private buildWelcomeTemplate(data: any): string {
    return this.buildBaseTemplate(`
      <p>Bonjour <strong>${data.recipientName}</strong>,</p>
      <p>Bienvenue sur <strong>LFTG Platform</strong> — le système de gestion de La Ferme Tropicale de Guyane !</p>
      <div class="alert-box success">
        <p>Votre compte a été créé avec succès.</p>
        ${data.temporaryPassword ? `<p><strong>Mot de passe temporaire :</strong> <code>${data.temporaryPassword}</code></p><p>Veuillez le changer dès votre première connexion.</p>` : ''}
      </div>
      <a href="${data.appUrl}/login" class="btn">Accéder à la plateforme</a>
    `, 'Bienvenue sur LFTG Platform');
  }

  private buildBroodAlertTemplate(data: any): string {
    return this.buildBaseTemplate(`
      <p>Bonjour <strong>${data.recipientName}</strong>,</p>
      <p>Une éclosion est prévue prochainement :</p>
      <div class="alert-box success">
        <table>
          <tr><th>Espèce</th><td><strong>${data.speciesName}</strong></td></tr>
          <tr><th>Nombre d'œufs</th><td>${data.eggsCount}</td></tr>
          <tr><th>Date d'éclosion prévue</th><td><strong>${data.expectedHatchDate.toLocaleDateString('fr-FR')}</strong></td></tr>
        </table>
      </div>
      <p>Assurez-vous que les conditions d'incubation sont optimales.</p>
    `, `Éclosion imminente — ${data.speciesName}`);
  }
}
