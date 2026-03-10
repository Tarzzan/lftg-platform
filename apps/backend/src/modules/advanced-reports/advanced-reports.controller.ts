// @ts-nocheck
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProduces, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { AdvancedReportsService } from './advanced-reports.service';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@ApiTags('advanced-reports')
@ApiBearerAuth()
@Controller('advanced-reports')
export class AdvancedReportsController {
  constructor(private readonly advancedReportsService: AdvancedReportsService) {}

  @Get('cites')
  @ApiOperation({ summary: "Génère le rapport CITES en PDF (animaux protégés)" })
  @ApiProduces("application/pdf")
  @ApiResponse({ status: 200, description: "Fichier PDF du rapport CITES" })
  async generateCitesReport(@Res() res: Response) {
    const pdfBuffer = await this.advancedReportsService.generateCitesReport();
    res.set({
      "Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=cites-report.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Get('annual')
  @ApiOperation({ summary: "Génère le rapport annuel en PDF pour une année donnée" })
  @ApiProduces("application/pdf")
  @ApiQuery({ name: 'year', required: false, type: Number, description: "Année du rapport (défaut: année courante)" })
  @ApiResponse({ status: 200, description: "Fichier PDF du rapport annuel" })
  async generateAnnualReport(@Query('year') year: number, @Res() res: Response) {
    const reportYear = year || new Date().getFullYear();
    const pdfBuffer = await this.advancedReportsService.generateAnnualReport(reportYear);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=annual-report-${reportYear}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Get('annual/:year')
  @ApiOperation({ summary: "Génère le rapport annuel via paramètre de route" })
  @ApiProduces("application/pdf")
  @ApiResponse({ status: 200, description: "Fichier PDF du rapport annuel" })
  async generateAnnualReportByParam(@Param("year") year: string, @Res() res: Response) {
    const reportYear = parseInt(year) || new Date().getFullYear();
    const pdfBuffer = await this.advancedReportsService.generateAnnualReport(reportYear);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=annual-report-${reportYear}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
