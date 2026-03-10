import { ApiProperty } from '@nestjs/swagger';
export class CreateWebhookDto {
  @ApiProperty({ description: "URL cible du webhook', example: "https://example.com/webhook' })
  url: string;

  @ApiProperty({ description: "Événements à écouter', type: [String], example: ["animal.created', 'animal.updated'] })
  events: string[];

  @ApiProperty({ description: 'Secret HMAC pour la signature', required: false })
  secret?: string;
}
