import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
  SUCCESS = 'SUCCESS',
}

export class CreateNotificationDto {
  @ApiProperty({ description: "Titre de la notification" })
  @IsString()
  title: string;

  @ApiProperty({ description: "Message de la notification" })
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.INFO })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: "IDs des utilisateurs destinataires" })
  @IsOptional()
  @IsArray()
  userIds?: string[];
}

export class MarkReadDto {
  @ApiProperty({ description: "IDs des notifications à marquer comme lues" })
  @IsArray()
  ids: string[];
}
