// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';
export class ExportQueryDto {
  @ApiProperty({ description: "Format d'export', enum: ['csv', 'xlsx", 'pdf'], default: 'csv' })
  format?: string;

  @ApiProperty({ description: "Type de données à exporter", enum: ['animaux', 'enclos', 'personnel', 'stock', 'ventes'] })
  type: string;

  @ApiProperty({ description: "Date de début (ISO 8601)", required: false })
  from?: string;

  @ApiProperty({ description: "Date de fin (ISO 8601)", required: false })
  to?: string;
}
