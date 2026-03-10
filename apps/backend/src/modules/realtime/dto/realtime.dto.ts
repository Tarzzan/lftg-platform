// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
export class RealtimeEventDto {
  @ApiProperty({ description: "Type d\'événement", example: 'animal.updated' })
  event: string;

  @ApiProperty({ description: "Données de l\'événement" })
  data: Record<string, unknown>;
}
