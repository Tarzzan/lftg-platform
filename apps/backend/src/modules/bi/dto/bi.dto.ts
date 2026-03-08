import { ApiProperty } from '@nestjs/swagger';
export class BiQueryDto {
  @ApiProperty({ 
    description: 'Période d\'analyse', 
    enum: ['week', 'month', 'quarter', 'year'],
    default: 'month'
  })
  period?: 'week' | 'month' | 'quarter' | 'year';

  @ApiProperty({ description: 'Nombre de mois pour les prévisions', default: 6 })
  months?: number;
}
