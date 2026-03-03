import { Module } from '@nestjs/common';
import { ParrainageService } from './parrainage.service';
import { ParrainageController } from './parrainage.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParrainageController],
  providers: [ParrainageService],
  exports: [ParrainageService],
})
export class ParrainageModule {}
