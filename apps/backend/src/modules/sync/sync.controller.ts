import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService, SyncPayload } from './sync.service';

@ApiTags('Synchronisation hors-ligne')
@ApiBearerAuth()
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @ApiOperation({ summary: 'Synchroniser les opérations hors-ligne' })
  sync(@Body() payload: SyncPayload) {
    return this.syncService.sync(payload);
  }

  @Get('status/:clientId')
  @ApiOperation({ summary: 'Statut de sync d\'un client' })
  getSyncStatus(@Param('clientId') clientId: string) {
    return this.syncService.getSyncStatus(clientId);
  }

  @Get('snapshot/:userId')
  @ApiOperation({ summary: 'Snapshot hors-ligne initial' })
  getOfflineSnapshot(@Param('userId') userId: string) {
    return this.syncService.getOfflineSnapshot(userId);
  }

  @Get('changes')
  @ApiOperation({ summary: 'Changements serveur depuis une date' })
  getChanges(@Body() body: { since: string }) {
    return this.syncService.getServerChangesSince(body.since || new Date(Date.now() - 3600000).toISOString());
  }
}
