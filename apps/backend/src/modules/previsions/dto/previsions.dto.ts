import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrevisionDto {
  @ApiProperty({ description: "Titre de la prévision" })
  @IsString()
  title: string;

  @ApiProperty({ description: "Date de début de la période" })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: "Date de fin de la période" })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: "Budget prévisionnel en euros" })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ description: "Notes et commentaires" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PrevisionQueryDto {
  @ApiPropertyOptional({ description: "Année de la prévision" })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ description: 'Filtrer par catégorie' })
  @IsOptional()
  @IsString()
  category?: string;
}
