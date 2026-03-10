import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSiteDto {
  @ApiProperty({ description: "Nom du site', example: "Site Principal LFTG' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Adresse du site' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: "Capacité maximale en animaux', example: 200 })
  @IsOptional()
  @IsNumber()
  capacity?: number;
}

export class TransferAnimalDto {
  @ApiProperty({ description: "ID du site de destination' })
  @IsNotEmpty()
  @IsString()
  toSiteId: string;

  @ApiProperty({ description: "ID de l animal à transférer' })
  @IsNotEmpty()
  @IsString()
  animalId: string;
}
