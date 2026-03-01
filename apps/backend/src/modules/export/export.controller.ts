import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExportService } from './export.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── CSV exports ─────────────────────────────────────────────────────────

  @Get('stock/csv')
  async stockCsv(@Res() res: Response) {
    const csv = await this.exportService.exportStockCsv();
    const filename = `stock-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM for Excel
  }

  @Get('animaux/csv')
  async animauxCsv(@Res() res: Response) {
    const csv = await this.exportService.exportAnimauxCsv();
    const filename = `animaux-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  }

  @Get('audit/csv')
  async auditCsv(@Res() res: Response, @Query('limit') limit?: string) {
    const csv = await this.exportService.exportAuditCsv(limit ? parseInt(limit) : 1000);
    const filename = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  }

  @Get('personnel/csv')
  async personnelCsv(@Res() res: Response) {
    const csv = await this.exportService.exportPersonnelCsv();
    const filename = `personnel-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  }

  @Get('formation/csv')
  async formationCsv(@Res() res: Response) {
    const csv = await this.exportService.exportFormationCsv();
    const filename = `formation-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  }

  // ─── HTML report (PDF-ready) ─────────────────────────────────────────────

  @Get('stock/report')
  async stockReport(@Res() res: Response) {
    const items = await this.prisma.stockItem.findMany({ orderBy: { name: 'asc' } });
    const html = this.exportService.buildStockReportHtml(items);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
