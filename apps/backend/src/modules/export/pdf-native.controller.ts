import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PdfNativeService } from './pdf-native.service';

@ApiTags('Export')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class PdfNativeController {
  constructor(private readonly pdfNativeService: PdfNativeService) {}

  @Get('monthly')
  @ApiOperation({ summary: "Rapport mensuel complet (PDF)" })
  @ApiQuery({ name: "year", required: false, example: 2026 })
  @ApiQuery({ name: 'month', required: false, example: 3 })
  @ApiResponse({ status: 200, description: "Fichier PDF du rapport mensuel", content: { "application/pdf': {} } })
  async getMonthlyReport(
    @Query('year') year: string,
    @Query('month') month: string,
    @Res() res: Response,
  ) {
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const buffer = await this.pdfNativeService.generateMonthlyReport(y, m);
    const isHtml = buffer.toString('utf-8', 0, 15).includes('<!DOCTYPE');
    res.setHeader('Content-Type', isHtml ? 'text/html; charset=utf-8' : 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapport-mensuel-${y}-${m}.${isHtml ? 'html' : 'pdf'}"`);
    res.send(buffer);
  }

  @Get('animal/:id/medical')
  @ApiOperation({ summary: "Dossier médical d\'un animal (PDF)" })
  @ApiParam({ name: 'id', description: "ID de l\'animal" })
  @ApiResponse({ status: 200, description: "Dossier médical PDF de l\'animal", content: { 'application/pdf': {} } })
  async getAnimalMedicalRecord(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.pdfNativeService.generateAnimalMedicalRecord(id);
    const isHtml = buffer.toString('utf-8', 0, 15).includes('<!DOCTYPE');
    res.setHeader('Content-Type', isHtml ? 'text/html; charset=utf-8' : 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="dossier-medical-${id}.${isHtml ? 'html' : 'pdf'}"`);
    res.send(buffer);
  }

  @Get('stock/inventory')
  @ApiOperation({ summary: "Inventaire complet du stock (PDF)" })
  @ApiResponse({ status: 200, description: "Inventaire PDF du stock", content: { 'application/pdf': {} } })
  async getStockInventory(@Res() res: Response) {
    const buffer = await this.pdfNativeService.generateStockInventory();
    const isHtml = buffer.toString('utf-8', 0, 15).includes('<!DOCTYPE');
    res.setHeader('Content-Type', isHtml ? 'text/html; charset=utf-8' : 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="inventaire-stock.${isHtml ? 'html' : 'pdf'}"`);
    res.send(buffer);
  }

  @Get('sales')
  @ApiOperation({ summary: "Rapport des ventes sur une période (PDF)" })
  @ApiQuery({ name: "dateFrom", required: true, example: '2026-01-01' })
  @ApiQuery({ name: 'dateTo', required: true, example: '2026-03-31' })
  @ApiResponse({ status: 200, description: "Rapport PDF des ventes", content: { "application/pdf': {} } })
  async getSalesReport(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfNativeService.generateSalesReport(dateFrom, dateTo);
    const isHtml = buffer.toString('utf-8', 0, 15).includes('<!DOCTYPE');
    res.setHeader('Content-Type', isHtml ? 'text/html; charset=utf-8' : 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapport-ventes.${isHtml ? 'html' : 'pdf'}"`);
    res.send(buffer);
  }
}
