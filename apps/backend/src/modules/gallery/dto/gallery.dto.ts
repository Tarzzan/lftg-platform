import { ApiProperty } from '@nestjs/swagger';
export class UploadUrlDto {
  @ApiProperty({ description: 'Nom du fichier', example: 'photo-animal.jpg' })
  fileName: string;

  @ApiProperty({ description: 'Type MIME du fichier', example: 'image/jpeg' })
  contentType: string;
}
