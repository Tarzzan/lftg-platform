import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DemoQueryDto {
  @ApiPropertyOptional({
    description: 'Scénario de démonstration',
    example: 'zoo',
    enum: ['zoo', 'reptiles', 'oiseaux', 'mammiferes'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['zoo', 'reptiles', 'oiseaux', 'mammiferes'])
  scenario?: string;
}

export class DemoResetDto {
  @ApiPropertyOptional({ description: 'Confirmer la réinitialisation', example: true })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;
}

export class DemoStatusResponseDto {
  @ApiProperty({ description: 'Indique si le mode démo est actif' })
  isDemoMode: boolean;

  @ApiProperty({ description: 'Nombre total de données de démonstration en base' })
  demoDataCount: number;
}

export class DemoClearResponseDto {
  @ApiProperty({ description: 'Nombre de lignes supprimées par table' })
  deleted: Record<string, number>;
}
