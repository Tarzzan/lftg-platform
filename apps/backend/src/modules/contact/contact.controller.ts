// @ts-nocheck
import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { EmailService } from '../email/email.service';

export class ContactDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  @MinLength(5)
  message: string;
}

export class InscriptionDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  site?: string;

  @IsOptional()
  @IsString()
  situation?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

@Controller('public/contact')
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async sendContact(@Body() dto: ContactDto) {
    if (!dto.name || !dto.email || !dto.message) {
      throw new BadRequestException('Champs obligatoires manquants');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new BadRequestException('Adresse email invalide');
    }

    // Envoyer l'email à l'administration LFTG
    await this.emailService.sendEmail({
      to: ['lftg973@gmail.com', 'lftg.secretariat@gmail.com'],
      subject: `[Contact LFTG] ${dto.subject || 'Nouveau message'} — ${dto.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2d6a4f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">📬 Nouveau message de contact</h2>
            <p style="margin: 4px 0 0; opacity: 0.8;">Via le site LFTG Centre de Formation</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Nom :</td><td style="padding: 8px 0; color: #111827;">${dto.name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Email :</td><td style="padding: 8px 0;"><a href="mailto:${dto.email}" style="color: #2d6a4f;">${dto.email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Sujet :</td><td style="padding: 8px 0; color: #111827;">${dto.subject || 'Non précisé'}</td></tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <h3 style="color: #374151; margin: 0 0 8px;">Message :</h3>
            <div style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; color: #374151; line-height: 1.6;">
              ${dto.message.replace(/\n/g, '<br>')}
            </div>
            <p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af;">
              Message reçu le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} à ${new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
      `,
      text: `Nouveau message de ${dto.name} (${dto.email})\nSujet: ${dto.subject}\n\n${dto.message}`,
    });

    // Accusé de réception à l'expéditeur
    await this.emailService.sendEmail({
      to: dto.email,
      subject: 'LFTG — Nous avons bien reçu votre message',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2d6a4f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">✅ Message reçu</h2>
            <p style="margin: 4px 0 0; opacity: 0.8;">LFTG Centre de Formation</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Bonjour <strong>${dto.name}</strong>,</p>
            <p>Nous avons bien reçu votre message et nous vous répondrons dans les meilleurs délais (généralement sous 48h ouvrées).</p>
            <div style="background: #ecfdf5; border-left: 4px solid #2d6a4f; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0; font-size: 14px; color: #065f46;"><strong>Votre message :</strong><br>${dto.message.replace(/\n/g, '<br>')}</p>
            </div>
            <p>Pour toute urgence, vous pouvez nous joindre directement :</p>
            <ul>
              <li>📞 <a href="tel:+594694426152">+594 6 94 42 61 52</a></li>
              <li>📧 <a href="mailto:lftg973@gmail.com">lftg973@gmail.com</a></li>
            </ul>
            <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">Cordialement,<br><strong>L'équipe LFTG Centre de Formation</strong><br>La Ferme Tropicale de Guyane</p>
          </div>
        </div>
      `,
      text: `Bonjour ${dto.name},\n\nNous avons bien reçu votre message et vous répondrons sous 48h.\n\nCordialement,\nLFTG Centre de Formation`,
    });

    return { success: true, message: 'Message envoyé avec succès' };
  }

  @Post('inscription')
  @HttpCode(HttpStatus.OK)
  async sendInscription(@Body() dto: InscriptionDto) {
    if (!dto.firstName || !dto.lastName || !dto.email || !dto.phone) {
      throw new BadRequestException('Champs obligatoires manquants');
    }

    // Notifier l'administration
    await this.emailService.sendEmail({
      to: ['lftg973@gmail.com', 'lftg.secretariat@gmail.com'],
      subject: `[Inscription CCAND-EGG] Nouvelle candidature — ${dto.firstName} ${dto.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2d6a4f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">🎓 Nouvelle candidature CCAND-EGG</h2>
            <p style="margin: 4px 0 0; opacity: 0.8;">Session Avril 2026</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151; width: 160px;">Prénom :</td><td style="padding: 8px 0;">${dto.firstName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Nom :</td><td style="padding: 8px 0;">${dto.lastName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Email :</td><td style="padding: 8px 0;"><a href="mailto:${dto.email}" style="color: #2d6a4f;">${dto.email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Téléphone :</td><td style="padding: 8px 0;"><a href="tel:${dto.phone}">${dto.phone}</a></td></tr>
              ${dto.birthDate ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Date de naissance :</td><td style="padding: 8px 0;">${dto.birthDate}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Site souhaité :</td><td style="padding: 8px 0;">${dto.site}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Situation :</td><td style="padding: 8px 0;">${dto.situation}</td></tr>
            </table>
            ${dto.message ? `
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <h3 style="color: #374151; margin: 0 0 8px;">Message du candidat :</h3>
            <div style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; color: #374151;">
              ${dto.message.replace(/\n/g, '<br>')}
            </div>` : ''}
            <p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af;">
              Candidature reçue le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} à ${new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
      `,
      text: `Nouvelle candidature CCAND-EGG\n${dto.firstName} ${dto.lastName}\nEmail: ${dto.email}\nTél: ${dto.phone}\nSite: ${dto.site}\nSituation: ${dto.situation}`,
    });

    // Accusé de réception au candidat
    await this.emailService.sendEmail({
      to: dto.email,
      subject: 'LFTG — Votre candidature CCAND-EGG a bien été reçue',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2d6a4f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">🎓 Candidature reçue</h2>
            <p style="margin: 4px 0 0; opacity: 0.8;">Formation CCAND-EGG — Session Avril 2026</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Bonjour <strong>${dto.firstName} ${dto.lastName}</strong>,</p>
            <p>Nous avons bien reçu votre candidature pour la formation <strong>CCAND-EGG — Session Avril 2026</strong>.</p>
            <div style="background: #ecfdf5; border-left: 4px solid #2d6a4f; padding: 16px; border-radius: 4px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px; color: #065f46;">📋 Prochaines étapes</h3>
              <ol style="margin: 0; padding-left: 20px; color: #065f46;">
                <li style="margin-bottom: 6px;">Notre équipe examine votre dossier</li>
                <li style="margin-bottom: 6px;">Vous serez contacté(e) pour un <strong>entretien de motivation</strong></li>
                <li>Réponse définitive sous <strong>15 jours ouvrés</strong></li>
              </ol>
            </div>
            <p>En attendant, vous pouvez :</p>
            <ul>
              <li>Préparer votre <strong>lettre de motivation</strong></li>
              <li>Rassembler vos <strong>pièces justificatives</strong> (CNI, justificatif de domicile, CV)</li>
              <li>Télécharger et lire le <a href="http://51.210.15.92/docs/livret-ccand-egg.pdf" style="color: #2d6a4f;">livret de formation complet</a></li>
            </ul>
            <p>Pour toute question :</p>
            <ul>
              <li>📞 <a href="tel:+594694426152">+594 6 94 42 61 52</a></li>
              <li>📧 <a href="mailto:lftg973@gmail.com">lftg973@gmail.com</a></li>
            </ul>
            <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">Cordialement,<br><strong>L'équipe LFTG Centre de Formation</strong><br>La Ferme Tropicale de Guyane</p>
          </div>
        </div>
      `,
      text: `Bonjour ${dto.firstName},\n\nVotre candidature CCAND-EGG a bien été reçue. Vous serez contacté(e) pour un entretien sous 15 jours.\n\nCordialement,\nLFTG Centre de Formation`,
    });

    return { success: true, message: 'Candidature envoyée avec succès' };
  }
}
