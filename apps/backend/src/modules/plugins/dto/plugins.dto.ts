import { ApiProperty } from '@nestjs/swagger';
export class PluginQueryDto {
  @ApiProperty({ description: "Nom du plugin', required: false })
  name?: string;

  @ApiProperty({ description: "Statut du plugin', enum: ['active', 'inactive'], required: false })
  status?: string;
}
