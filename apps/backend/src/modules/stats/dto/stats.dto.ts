import { IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StatsQueryDto {
  @ApiPropertyOptional({ description: "Nombre de jours pour l historique', example: 30 })
  @IsOptional()
  @IsNumber()
  days?: number;

  @ApiPropertyOptional({ description: "Type de statistique', example: 'animals' })
  @IsOptional()
  @IsString()
  type?: string;
}
