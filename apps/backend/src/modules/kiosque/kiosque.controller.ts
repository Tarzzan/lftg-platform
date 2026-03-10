import { Public } from '../../common/decorators/public.decorator';
import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KiosqueService } from './kiosque.service';

@ApiTags('Kiosque')
@ApiBearerAuth()
@Public()
@Controller('kiosque')
export class KiosqueController {
  constructor(private readonly kiosqueService: KiosqueService) {}

  @Get('tasks')
  @ApiOperation({ summary: "Tâches du jour pour le soigneur" })
  getTodayTasks(@Query('userId') userId?: string) {
    return this.kiosqueService.getTodayTasks(userId);
  }

  @Put('tasks/:id/complete')
  @ApiOperation({ summary: "Marquer une tâche comme terminée" })
  completeTask(@Param('id') id: string, @Body() body: any) {
    return this.kiosqueService.completeTask(id, body);
  }

  @Post('scan')
  @ApiOperation({ summary: "Scanner un QR code animal" })
  quickScan(@Body() body: { qrCode: string }) {
    return this.kiosqueService.quickScan(body.qrCode);
  }

  @Post('notes')
  @ApiOperation({ summary: "Ajouter une note rapide sur un animal" })
  quickNote(@Body() body: { animalId: string; note: string; type: string }) {
    return this.kiosqueService.quickNote(body.animalId, body.note, body.type);
  }

  @Get("alerts")
  @ApiOperation({ summary: 'Alertes urgentes du jour' })
  getAlerts() {
    return this.kiosqueService.getAlerts();
  }
}
