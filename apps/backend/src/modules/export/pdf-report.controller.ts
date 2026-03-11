// @ts-nocheck
import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PdfReportService } from './pdf-report.service';

@ApiTags('Export')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class PdfReportController {
  constructor(private readonly pdfReportService: PdfReportService) {}

  /**
   * GET /reports/monthly?year=2025&month=3
   * Génère le rapport mensuel HTML
   */
  @Get('monthly')
  @ApiOperation({ summary: "Rapport mensuel HTML" })
  @ApiQuery({ name: 'year', required: false, example: 2026 })
  @ApiQuery({ name: 'month', required: false, example: 3 })
  @ApiResponse({ status: 200, description: "Rapport mensuel HTML généré", content: { 'text/html': {} } })
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
  @ApiOperation({ summary: "Dossier médical HTML d'un animal" })
  @ApiParam({ name: 'id', description: "ID de l'animal' })
  @ApiResponse({ status: 200, description: "Dossier médical HTML de l'animal", content: { 'text/html': {} } })
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
  @ApiOperation({ summary: "Rapport d'inventaire du stock HTML" })
  @ApiResponse({ status: 200, description: "Rapport HTML d'inventaire du stock", content: { 'text/html': {} } })
  async getStockInventoryReport(@Res() res: Response) {
    const { html, filename } = await this.pdfReportService.generateStockInventoryReport();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(html);
  }
}
