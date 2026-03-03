import { Controller, Get, Res, UseGuards } from '@nestjs/common';
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

  // ... autres routes d'export ...
}
