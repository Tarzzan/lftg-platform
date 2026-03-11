// @ts-nocheck
import { IsString, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchQueryDto {
  @ApiProperty({ description: "Terme de recherche (min 2 caractères)", example: 'matamata" })
  @IsString()
  q: string;

  @ApiPropertyOptional({
    description: "Type d'entité à filtrer",
    enum: ['animal', 'espece', 'enclos', 'employe', 'stock', 'formation'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['animal', 'espece', 'enclos', 'employe', 'stock', 'formation'])
  type?: string;

  @ApiPropertyOptional({ description: 'Limite de résultats (1-100)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class SearchResultDto {
  @ApiProperty() id: string;
  @ApiProperty() type: string;
  @ApiProperty() title: string;
  @ApiPropertyOptional() subtitle?: string;
  @ApiPropertyOptional() meta?: string;
  @ApiProperty() url: string;
}

export class SearchResponseDto {
  @ApiProperty({ type: [SearchResultDto] }) results: SearchResultDto[];
  @ApiProperty() total: number;
}
