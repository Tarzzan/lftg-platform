import { Controller, Post, Body } from '@nestjs/common';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post('upload-url')
  async getUploadUrl(
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string,
  ) {
    const url = await this.galleryService.getPresignedUrl(fileName, contentType);
    return { url };
  }
}
