import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MlService } from './ml.service';
@ApiTags('ML')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ml')
export class MlController {
  constructor(private readonly mlService: MlService) {}
  @Get('models')
  @ApiOperation({ summary: 'Liste des modèles ML' })
  getModels() { return []; }
  @Post('predict')
  @ApiOperation({ summary: 'Prédiction ML' })
  predict(@Body() body: any) { return { prediction: null, confidence: 0 }; }
}
