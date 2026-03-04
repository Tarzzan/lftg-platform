import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExportService } from './export.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Export')
@Controller('export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('stock/csv')
  @ApiOperation({ summary: 'Exporter l\'inventaire du stock en CSV' })
  async stockCsv(@Res() res: Response) {
    return this.exportService.exportStockCsv(res);
  }

  @Get('animaux/csv')
  @ApiOperation({ summary: 'Exporter la liste des animaux en CSV' })
  async animauxCsv(@Res() res: Response) {
    return this.exportService.exportAnimauxCsv(res);
  }

  @Get('personnel/csv')
  @ApiOperation({ summary: 'Exporter la liste du personnel en CSV' })
  async personnelCsv(@Res() res: Response) {
    return this.exportService.exportPersonnelCsv(res);
  }

  @Get('formation/csv')
  @ApiOperation({ summary: 'Exporter le catalogue de formations en CSV' })
  async formationCsv(@Res() res: Response) {
    return this.exportService.exportFormationCsv(res);
  }

  @Get('audit/csv')
  @ApiOperation({ summary: 'Exporter les logs d\'audit en CSV' })
  async auditCsv(@Query('limit') limit: string, @Res() res: Response) {
    return this.exportService.exportAuditCsv(res, limit ? parseInt(limit) : 1000);
  }

  @Get('stock/report')
  @ApiOperation({ summary: 'Rapport complet du stock en CSV' })
  async stockReport(@Res() res: Response) {
    return this.exportService.exportStockReport(res);
  }
}
