// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
export class AuditQueryDto {
  @ApiProperty({ description: "Identifiant de l'utilisateur', required: false })
  userId?: string;

  @ApiProperty({ description: "Action auditée", required: false })
  action?: string;

  @ApiProperty({ description: "Date de début (ISO 8601)", required: false })
  from?: string;

  @ApiProperty({ description: 'Date de fin (ISO 8601)', required: false })
  to?: string;
}
