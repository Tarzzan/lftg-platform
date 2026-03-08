import { ApiProperty } from '@nestjs/swagger';
export class SearchQueryDto {
  @ApiProperty({ description: 'Terme de recherche', example: 'matamata' })
  q: string;

  @ApiProperty({ description: 'Type d\'entité', enum: ['animal', 'espece', 'enclos', 'employe'], required: false })
  type?: string;

  @ApiProperty({ description: 'Limite de résultats', default: 20, required: false })
  limit?: number;
}
