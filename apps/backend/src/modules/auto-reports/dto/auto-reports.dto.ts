import { IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum ReportType {
  CITES = 'cites',
  HEALTH = 'health',
  SALES = 'sales',
  IOT = 'iot',
  ANNUAL = 'annual',
}

export class CreateScheduleDto {
  @ApiProperty({ description: 'Nom du rapport planifié', example: 'Rapport mensuel CITES' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ReportFrequency, description: "Fréquence d\'envoi" })
  @IsEnum(ReportFrequency)
  frequency: ReportFrequency;

  @ApiProperty({ description: 'Expression cron', example: '0 0 1 * *' })
  @IsString()
  cronExpr: string;

  @ApiProperty({ type: [String], description: 'Liste des destinataires email' })
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @ApiProperty({ enum: ReportType, description: 'Type de rapport' })
  @IsEnum(ReportType)
  type: ReportType;
}

export class ScheduleResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ enum: ReportFrequency }) frequency: ReportFrequency;
  @ApiProperty() cronExpr: string;
  @ApiProperty({ type: [String] }) recipients: string[];
  @ApiProperty({ enum: ReportType }) type: ReportType;
  @ApiProperty() status: string;
  @ApiPropertyOptional() lastRun: string | null;
  @ApiPropertyOptional() nextRun: string | null;
}
