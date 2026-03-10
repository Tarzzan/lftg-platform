import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  EXCEL = 'EXCEL',
}

export class GenerateReportDto {
  @ApiProperty({ description: "Type de rapport (animals, health, stock, financial)" })
  @IsString()
  type: string;

  @ApiPropertyOptional({ enum: ReportFormat, default: ReportFormat.PDF })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiPropertyOptional({ description: "Date de début" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: "Date de fin" })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ReportQueryDto {
  @ApiPropertyOptional({ description: "Filtrer par type de rapport" })
  @IsOptional()
  @IsString()
  type?: string;
}
