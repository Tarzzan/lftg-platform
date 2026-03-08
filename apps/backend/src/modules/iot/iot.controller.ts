import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Param, UseGuards} from '@nestjs/common';
import { IotService } from './iot.service';

@ApiTags('IoT & Capteurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('iot')
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @Get('sensors')
  getActiveSensors() {
    return this.iotService.getActiveSensors();
  }

  @Get('sensor/:id/history')
  getSensorHistory(@Param('id') id: string) {
    return this.iotService.getSensorHistory(id);
  }

  @Post('test-event')
  sendTestEvent(@Body() data: { topic: string; payload: any }) {
    return this.iotService.publishMqttMessage(data.topic, data.payload);
  }
}
