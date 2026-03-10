import { ApiProperty } from '@nestjs/swagger';
export class AccountingQueryDto {
  @ApiProperty({ description: "Année fiscale", example: 2024, required: false })
  year?: number;

  @ApiProperty({ description: "Mois (1-12)", example: 3, required: false })
  month?: number;
}
