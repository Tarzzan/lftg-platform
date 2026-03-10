import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: "Lister les rapports disponibles" })
  getAvailableReports() {
    return this.reportsService.getAvailableReports();
  }

  @Get("monthly")
  @ApiOperation({ summary: "Rapport mensuel HTML" })
  async getMonthlySummary(
    @Query("year") year: string = String(new Date().getFullYear()),
    @Query('month') month: string = String(new Date().getMonth() + 1),
    @Res() res: Response,
  ) {
    const html = await this.reportsService.generateMonthlySummary(parseInt(year), parseInt(month));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('animal/:id/medical')
  @ApiOperation({ summary: "Dossier médical animal HTML" })
  async getAnimalMedicalReport(@Param("id") id: string, @Res() res: Response) {
    const html = await this.reportsService.generateAnimalMedicalReport(id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('cites')
  @ApiOperation({ summary: "Bilan CITES HTML" })
  async getCITESReport(@Res() res: Response) {
    const html = await this.reportsService.generateCITESReport();
    res.setHeader("Content-Type", 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('hr')
  @ApiOperation({ summary: "Rapport RH HTML" })
  async getHRReport(@Res() res: Response) {
    const html = await this.reportsService.generateHRReport();
    res.setHeader("Content-Type", 'text/html; charset=utf-8');
    res.send(html);
  }
}
