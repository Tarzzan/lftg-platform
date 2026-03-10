// @ts-nocheck
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DocumentType {
  VETERINARY = 'VETERINARY',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  CITES = 'CITES',
  TRAINING = 'TRAINING',
  OTHER = 'OTHER',
}

export class CreateDocumentDto {
  @ApiProperty({ description: "Nom du document" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ description: "ID de l\'animal associé" })
  @IsOptional()
  @IsString()
  animalId?: string;

  @ApiPropertyOptional({ description: "URL du fichier" })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}

export class DocumentQueryDto {
  @ApiPropertyOptional({ description: "Filtrer par type de document" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: "Filtrer par ID d\'animal" })
  @IsOptional()
  @IsString()
  animalId?: string;
}
