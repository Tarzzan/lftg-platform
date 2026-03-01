import { Module } from '@nestjs/common';
import { MlController } from './ml.controller';
import { MlService } from './ml.service';

@Module({
  controllers: [MlController],
  providers: [MlService],
})
export class MlModule {}
