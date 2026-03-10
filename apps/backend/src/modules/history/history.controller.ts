// @ts-nocheck
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HistoryService } from './history.service';

@ApiTags('History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('recent')
  @ApiOperation({ summary: "Activité récente globale" })
  async getRecent(@Query('limit') limit?: string) {
    return this.historyService.getRecentActivity(limit ? parseInt(limit) : 100);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: "Historique d'une entité" })
  async getEntityHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.historyService.getEntityHistory(entityType, entityId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: "Activité d'un utilisateur" })
  async getUserActivity(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.historyService.getUserActivity(userId, limit ? parseInt(limit) : 50);
  }
}
