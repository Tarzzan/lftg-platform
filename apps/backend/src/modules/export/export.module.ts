import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { PdfReportService } from './pdf-report.service';
import { PdfReportController } from './pdf-report.controller';

@Module({
  controllers: [ExportController, PdfReportController],
  providers: [ExportService, PdfReportService],
  exports: [ExportService, PdfReportService],
})
export class ExportModule {}
