import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IotService } from './iot.service';

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
