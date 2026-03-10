// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
export class FcmTokenDto {
  @ApiProperty({ description: "Token FCM du device", example: "fcm_token_xxx" })
  token: string;

  @ApiProperty({ description: "Identifiant de l\'utilisateur" })
  userId: string;
}

export class FcmNotificationDto {
  @ApiProperty({ description: "Titre de la notification" })
  title: string;

  @ApiProperty({ description: "Corps de la notification" })
  body: string;

  @ApiProperty({ description: 'Identifiants des utilisateurs cibles', type: [String] })
  userIds: string[];
}
