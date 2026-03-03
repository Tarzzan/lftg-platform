import { Module } from '@nestjs/common';
import { AdvancedReportsController } from './advanced-reports.controller';
import { AdvancedReportsService } from './advanced-reports.service';

@Module({
  controllers: [AdvancedReportsController],
  providers: [AdvancedReportsService],
})
export class AdvancedReportsModule {}
