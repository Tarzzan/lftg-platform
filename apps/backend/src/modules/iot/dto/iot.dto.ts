import { ApiProperty } from '@nestjs/swagger';
export class IotReadingDto {
  @ApiProperty({ description: "Identifiant du capteur" })
  deviceId: string;

  @ApiProperty({ description: "Type de mesure", example: 'temperature' })
  type: string;

  @ApiProperty({ description: "Valeur mesurée", example: 25.5 })
  value: number;

  @ApiProperty({ description: "Unité de mesure", example: '°C" })
  unit: string;
}
