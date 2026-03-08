import { Module } from "@nestjs/common";
import { AutoReportsService } from "./auto-reports.service";
import { AutoReportsController } from "./auto-reports.controller";

@Module({
  controllers: [AutoReportsController],
  providers: [AutoReportsService],
  exports: [AutoReportsService],
})
export class AutoReportsModule {}
