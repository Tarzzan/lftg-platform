// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
export class SendEmailDto {
  @ApiProperty({ description: "Destinataire", example: "contact@lftg.fr" })
  to: string;

  @ApiProperty({ description: "Sujet de l\'email" })
  subject: string;

  @ApiProperty({ description: "Corps HTML de l\'email" })
  html: string;
}
