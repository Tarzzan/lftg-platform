import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProduces } from '@nestjs/swagger';
import { Controller, Get, Query, Res, UseGuards} from '@nestjs/common';
import { AdvancedReportsService } from './advanced-reports.service';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('advanced-reports')
export class AdvancedReportsController {
  constructor(private readonly advancedReportsService: AdvancedReportsService) {}

  @Get('cites')
  @ApiOperation({ summary: 'Génère le rapport CITES en PDF' })
  @ApiProduces('application/pdf')
  async generateCitesReport(@Res() res: Response) {
    const pdfBuffer = await this.advancedReportsService.generateCitesReport();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=cites-report.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Get('annual')
  async generateAnnualReport(@Query('year') year: number, @Res() res: Response) {
    const pdfBuffer = await this.advancedReportsService.generateAnnualReport(year);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=annual-report-${year}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
