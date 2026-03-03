import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
