import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AutoReportsService } from './auto-reports.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [AutoReportsService],
})
export class AutoReportsModule {}
