import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
// @ts-nocheck
import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Email')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // ─── Route publique — Formulaire de contact ───────────────────────────────

  @Public()
  @Post('contact')
  @HttpCode(200)
  async sendContact(@Body() dto: {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
    phone?: string;
  }) {
    if (!dto.senderName || !dto.senderEmail || !dto.subject || !dto.message) {
      return { success: false, error: 'Tous les champs obligatoires doivent être remplis' };
    }
    return this.emailService.sendContactForm(dto);
  }

  // ─── Routes protégées — Admin ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post('test')
  @Permissions('admin:email')
  async sendTestEmail(@Body() dto: { to: string; subject: string; message: string }) {
    return this.emailService.sendEmail({
      to: dto.to,
      subject: dto.subject,
      html: `<p>${dto.message}</p>`,
      text: dto.message,
    });
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post('welcome')
  @Permissions('admin:email')
  async sendWelcome(@Body() dto: {
    recipientEmail: string;
    recipientName: string;
    temporaryPassword?: string;
    appUrl: string;
  }) {
    return this.emailService.sendWelcomeEmail(dto);
  }
}
