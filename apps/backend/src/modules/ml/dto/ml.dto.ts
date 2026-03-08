import { ApiProperty } from '@nestjs/swagger';
export class MlQueryDto {
  @ApiProperty({ description: 'Identifiant de l\'animal', required: false })
  animalId?: string;
}
