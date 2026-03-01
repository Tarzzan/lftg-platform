import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  getAllSites() {
    return this.sitesService.getAllSites();
  }

  @Post()
  createSite(@Body() createSiteDto: any) {
    return this.sitesService.createSite(createSiteDto);
  }

  @Get(':id')
  getSiteById(@Param('id') id: string) {
    return this.sitesService.getSiteById(id);
  }

  @Put(':id/transfer')
  transferAnimal(@Param('id') fromSiteId: string, @Body() transferDto: any) {
    return this.sitesService.transferAnimal(fromSiteId, transferDto.toSiteId, transferDto.animalId);
  }
}
