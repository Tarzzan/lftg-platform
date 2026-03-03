import { Module } from '@nestjs/common';
import { TourismeController } from './tourisme.controller';
import { TourismeService } from './tourisme.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TourismeController],
  providers: [TourismeService],
  exports: [TourismeService],
})
export class TourismeModule {}
