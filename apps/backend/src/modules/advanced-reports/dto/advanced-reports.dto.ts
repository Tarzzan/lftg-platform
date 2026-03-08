import { ApiProperty } from '@nestjs/swagger';
export class AnnualReportQueryDto {
  @ApiProperty({ description: 'Année du rapport', example: 2024 })
  year: number;
}
