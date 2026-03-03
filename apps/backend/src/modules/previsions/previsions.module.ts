import { Module } from '@nestjs/common';
import { PrevisionsController } from './previsions.controller';
import { PrevisionsService } from './previsions.service';

@Module({
  controllers: [PrevisionsController],
  providers: [PrevisionsService],
  exports: [PrevisionsService],
})
export class PrevisionsModule {}
