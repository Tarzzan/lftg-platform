import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { PdfReportService } from './pdf-report.service';
import { PdfReportController } from './pdf-report.controller';
import { PdfNativeService } from './pdf-native.service';
import { PdfNativeController } from './pdf-native.controller';

@Module({
  controllers: [ExportController, PdfReportController, PdfNativeController],
  providers: [ExportService, PdfReportService, PdfNativeService],
  exports: [ExportService, PdfReportService, PdfNativeService],
})
export class ExportModule {}
