import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AccountingService } from './accounting.service';

@ApiTags('Comptabilité')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('fec')
  @ApiOperation({ summary: 'Exporter le FEC (Fichier des Écritures Comptables)' })
  async generateFEC(
    @Query('year') year: number,
    @Query('month') month?: number,
    @Res() res?: Response,
  ) {
    const result = await this.accountingService.generateFEC(+year || new Date().getFullYear(), month ? +month : undefined);
    if (res) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.send(result.content);
    }
    return result;
  }

  @Get('summary')
  @ApiOperation({ summary: 'Résumé comptable annuel' })
  getSummary(@Query('year') year: number) {
    return this.accountingService.getAccountingSummary(+year || new Date().getFullYear());
  }
}
