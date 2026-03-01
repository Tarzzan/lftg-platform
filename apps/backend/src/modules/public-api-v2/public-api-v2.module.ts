import { Module } from '@nestjs/common';
import { PublicApiV2Controller } from './public-api-v2.controller';
import { PublicApiV2Service } from './public-api-v2.service';

@Module({
  controllers: [PublicApiV2Controller],
  providers: [PublicApiV2Service],
})
export class PublicApiV2Module {}
