import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BiService } from './bi.service';
@ApiTags('BI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bi')
export class BiController {
  constructor(private readonly biService: BiService) {}
  @Get('kpis')
  @ApiOperation({ summary: 'Indicateurs clés de performance' })
  getKpis() { return []; }
  @Get('custom-report')
  @ApiOperation({ summary: 'Rapport BI personnalisé' })
  getCustomReport() { return {}; }
}
