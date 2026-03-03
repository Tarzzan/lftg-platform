import { Module } from '@nestjs/common';
import { ElevageService } from './elevage.service';
import { ElevageController } from './elevage.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ElevageController],
  providers: [ElevageService],
  exports: [ElevageService],
})
export class ElevageModule {}
