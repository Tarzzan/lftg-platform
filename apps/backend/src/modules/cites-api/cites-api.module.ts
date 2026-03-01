import { Module } from '@nestjs/common';
import { CitesApiController } from './cites-api.controller';
import { CitesApiService } from './cites-api.service';

@Module({
  controllers: [CitesApiController],
  providers: [CitesApiService],
  exports: [CitesApiService],
})
export class CitesApiModule {}
