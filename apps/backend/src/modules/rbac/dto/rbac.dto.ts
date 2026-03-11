// @ts-nocheck
import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: "Nom unique du rôle", example: 'VETERINAIRE' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Description du rôle" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], description: "IDs des permissions à associer" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}

export class CreatePermissionDto {
  @ApiProperty({ description: "Action autorisée", example: 'read' })
  @IsString()
  action: string;

  @ApiProperty({ description: "Ressource concernée", example: 'Animal' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({ description: "Description de la permission" })
  @IsOptional()
  @IsString()
  description?: string;
}

export class AssignRoleDto {
  @ApiProperty({ description: "ID de l'utilisateur' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'ID du rôle' })
  @IsString()
  roleId: string;
}

export class RoleResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty({ type: [Object] }) permissions: any[];
}

export class PermissionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() action: string;
  @ApiProperty() subject: string;
  @ApiPropertyOptional() description?: string;
}
