import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCitesPermitDto {
  @ApiProperty({ description: "Numéro du permis CITES" })
  @IsString()
  permitNumber: string;

  @ApiProperty({ description: "ID de l\'animal concerné" })
  @IsString()
  animalId: string;

  @ApiProperty({ description: "Date d\'expiration du permis" })
  @IsDateString()
  expiresAt: string;

  @ApiPropertyOptional({ description: "Notes additionnelles" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CitesQueryDto {
  @ApiPropertyOptional({ description: "Filtrer par statut (valid, expired, pending)" })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: "Filtrer par ID d\'animal" })
  @IsOptional()
  @IsString()
  animalId?: string;
}
