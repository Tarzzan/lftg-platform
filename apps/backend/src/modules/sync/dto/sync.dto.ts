import { IsString, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSyncDto {
  @ApiProperty({ description: "Nom", example: "item-001" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Description" })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSyncDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export class SyncResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description?: string;
}
