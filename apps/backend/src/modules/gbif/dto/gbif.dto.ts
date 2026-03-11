import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGbifDto {
  @ApiProperty({ description: "Identifiant unique", example: 'item-001' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Description" })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateGbifDto {
  @ApiPropertyOptional({ description: "Nom mis à jour" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description mise à jour' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class GbifResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty() createdAt: string;
  @ApiPropertyOptional() updatedAt?: string;
}
