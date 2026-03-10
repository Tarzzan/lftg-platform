import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: "Période en jours", example: 30 })
  @IsOptional()
  @IsNumber()
  days?: number;

  @ApiPropertyOptional({ description: "Type de métrique", example: 'visits' })
  @IsOptional()
  @IsString()
  metric?: string;
}
