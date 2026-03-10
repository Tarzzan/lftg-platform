import { Public } from '../../common/decorators/public.decorator';
import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TourismeService } from './tourisme.service';

@ApiTags('Tourisme')
@ApiBearerAuth()
@Public()
@Controller('tourisme')
export class TourismeController {
  constructor(private readonly tourismeService: TourismeService) {}

  @Get('visites')
  @ApiOperation({ summary: "Liste des visites guidées' })
  getVisites(@Query("status') status?: string) {
    return this.tourismeService.getVisites({ status });
  }

  @Post('visites')
  @ApiOperation({ summary: "Créer une visite' })
  createVisite(@Body() body: any) {
    return this.tourismeService.createVisite(body);
  }

  @Get("reservations')
  @ApiOperation({ summary: "Liste des réservations' })
  getReservations(@Query("status') status?: string) {
    return this.tourismeService.getReservations({ status });
  }

  @Post('reservations')
  @ApiOperation({ summary: "Créer une réservation' })
  createReservation(@Body() body: any) {
    return this.tourismeService.createReservation(body);
  }

  @Put("reservations/:id/status')
  @ApiOperation({ summary: "Mettre à jour le statut d\'une réservation" })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.tourismeService.updateReservationStatus(id, body.status);
  }

  @Get('stats')
  @ApiOperation({ summary: "Statistiques tourisme' })
  getStats() {
    return this.tourismeService.getStats();
  }

  @Get("calendar')
  @ApiOperation({ summary: "Calendrier des visites' })
  getCalendar(@Query("year') year: string, @Query('month') month: string) {
    return this.tourismeService.getCalendar(parseInt(year) || 2026, parseInt(month) || 3);
  }
}
