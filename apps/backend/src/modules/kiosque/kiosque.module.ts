import { Module } from '@nestjs/common';
import { KiosqueController } from './kiosque.controller';
import { KiosqueService } from './kiosque.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KiosqueController],
  providers: [KiosqueService],
  exports: [KiosqueService],
})
export class KiosqueModule {}
