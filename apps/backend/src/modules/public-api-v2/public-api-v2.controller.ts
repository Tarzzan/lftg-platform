import { Controller, Get, Post, Body, Query, Headers } from '@nestjs/common';
import { PublicApiV2Service } from './public-api-v2.service';

@Controller('public/v2')
export class PublicApiV2Controller {
  constructor(private readonly publicApiV2Service: PublicApiV2Service) {}

  @Get('species')
  getSpecies(@Query('taxon') taxon: string) {
    return this.publicApiV2Service.getSpecies(taxon);
  }

  @Post('observations')
  addObservation(@Body() observation: any, @Headers('X-API-KEY') apiKey: string) {
    this.publicApiV2Service.validateApiKey(apiKey);
    return this.publicApiV2Service.addObservation(observation);
  }
}
