import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuditService } from './audit.service';
@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}
  @Get('logs')
  @ApiOperation({ summary: 'Journaux d audit' })
  getLogs(@Query('limit') limit?: string) {
    return [];
  }
  @Get('stats')
  @ApiOperation({ summary: 'Statistiques d audit' })
  getStats() { return { total: 0, byAction: {} }; }
  @Get('actions')
  @ApiOperation({ summary: 'Liste des actions' })
  getActions() { return []; }
}
