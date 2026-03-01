import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PdfReportService } from './pdf-report.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class PdfReportController {
  constructor(private readonly pdfReportService: PdfReportService) {}

  /**
   * GET /reports/monthly?year=2025&month=3
   * Génère le rapport mensuel HTML
   */
  @Get('monthly')
  async getMonthlyReport(
    @Query('year') year: string,
    @Query('month') month: string,
    @Res() res: Response,
  ) {
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;

    const { html, filename } = await this.pdfReportService.generateMonthlyReport(y, m);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(html);
  }

  /**
   * GET /reports/animal/:id/medical
   * Génère le dossier médical d'un animal
   */
  @Get('animal/:id/medical')
  async getAnimalMedicalReport(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { html, filename } = await this.pdfReportService.generateAnimalMedicalReport(id);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(html);
  }

  /**
   * GET /reports/stock/inventory
   * Génère le rapport d'inventaire du stock
   */
  @Get('stock/inventory')
  async getStockInventoryReport(@Res() res: Response) {
    const { html, filename } = await this.pdfReportService.generateStockInventoryReport();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(html);
  }
}
