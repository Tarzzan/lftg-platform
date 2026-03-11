import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class AuditQueryDto {
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
}

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  @ApiOperation({ summary: "Consulte les logs d'audit" })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  findAll(@Query() query: AuditQueryDto) {
    return this.service.findAll({
      userId: query.userId,
      action: query.action,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: "Statistiques des logs d'audit" })
  getStats() {
    return this.service.getStats?.() ?? { total: 0, byAction: {} };
  }

  @Get('users/:userId')
  @ApiOperation({ summary: "Logs d'audit d"un utilisateur' })
  findByUser(@Param('userId') userId: string) {
    return this.service.findAll({ userId });
  }

  @Get('actions')
  @ApiOperation({ summary: 'Liste des actions disponibles' })
  getActions() {
    return this.service.getActions?.() ?? [];
  }
}
