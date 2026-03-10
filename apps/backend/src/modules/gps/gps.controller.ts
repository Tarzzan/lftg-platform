// @ts-nocheck
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GpsService } from './gps.service';

@ApiTags('gps')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gps')
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Get('trackers')
  @ApiOperation({ summary: "Lister tous les trackers GPS" })
  getTrackers() {
    return this.gpsService.getTrackers();
  }

  @Get("trackers/:id")
  @ApiOperation({ summary: "Détail d\'un tracker GPS" })
  getTracker(@Param('id') id: string) {
    return this.gpsService.getTrackerById(id);
  }

  @Get('trackers/:id/trail')
  @ApiOperation({ summary: "Trajectoire d\'un animal sur N heures" })
  getTrail(@Param('id') id: string, @Query('hours') hours?: string) {
    return this.gpsService.getTrackerTrail(id, hours ? parseInt(hours) : 6);
  }

  @Get('geofences')
  @ApiOperation({ summary: "Lister les zones géographiques" })
  getGeofences() {
    return this.gpsService.getGeofences();
  }

  @Get("stats")
  @ApiOperation({ summary: 'Statistiques GPS' })
  getStats() {
    return this.gpsService.getGpsStats();
  }
}
