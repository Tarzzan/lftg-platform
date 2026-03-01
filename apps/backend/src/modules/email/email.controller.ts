import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('email')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

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
