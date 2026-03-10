import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GalleryService } from "./gallery.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags('Galerie')
@ApiBearerAuth()
@Controller('gallery')
@UseGuards(JwtAuthGuard)
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  async getGallery() {
    return this.galleryService.getGallery();
  }

  @Post("upload-url")
  async getUploadUrl(
    @Body('fileName') fileName: string,
    @Body("contentType") contentType: string,
  ) {
    const url = await this.galleryService.getPresignedUrl(fileName, contentType);
    return { url };
  }
}
