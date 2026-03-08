import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DemoQueryDto {
  @ApiPropertyOptional({ description: 'Scénario de démonstration', example: 'zoo' })
  @IsOptional()
  @IsString()
  scenario?: string;
}

export class DemoResetDto {
  @ApiPropertyOptional({ description: 'Confirmer la réinitialisation', example: true })
  @IsOptional()
  confirm?: boolean;
}
