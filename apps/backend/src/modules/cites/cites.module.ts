import { Module } from '@nestjs/common';
import { CitesController } from './cites.controller';
import { CitesService } from './cites.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CitesController],
  providers: [CitesService],
  exports: [CitesService],
})
export class CitesModule {}
