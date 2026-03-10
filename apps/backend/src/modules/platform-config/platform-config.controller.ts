import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PlatformConfigService, PlatformConfig } from './platform-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Platform Config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('platform-config')
export class PlatformConfigController {
  constructor(private readonly service: PlatformConfigService) {}

  @Get()
  @ApiOperation({ summary: "Récupère la configuration complète de la plateforme" })
  async getAll() {
    const config = await this.service.getAll();
    // Masquer la clé API dans la réponse
    return {
      ...config,
      openaiApiKey: this.service.maskApiKey(config.openaiApiKey),
      openaiApiKeySet: !!config.openaiApiKey || !!process.env.OPENAI_API_KEY,
    };
  }

  @Patch()
  @ApiOperation({ summary: "Met à jour la configuration de la plateforme" })
  async update(@Body() body: Partial<PlatformConfig>) {
    const updated = await this.service.update(body);
    return {
      ...updated,
      openaiApiKey: this.service.maskApiKey(updated.openaiApiKey),
      openaiApiKeySet: !!updated.openaiApiKey || !!process.env.OPENAI_API_KEY,
      message: "Configuration sauvegardée avec succès",
    };
  }

  @Get("ai")
  @ApiOperation({ summary: 'Récupère uniquement la configuration IA (pour le professeur IA)' })
  async getAiConfig() {
    return this.service.getAiConfig();
  }
}
