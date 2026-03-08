// @ts-nocheck
import { Controller, Get, Post, Delete, Body, Query, Headers, Param, UseGuards } from '@nestjs/common';
import { PublicApiV2Service } from './public-api-v2.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import * as crypto from 'crypto';

// In-memory store for API keys (would be Prisma in production)
const API_KEYS: any[] = [];

@Controller('public/v2')
export class PublicApiV2Controller {
  constructor(private readonly publicApiV2Service: PublicApiV2Service) {}

  @Get('species')
  getSpecies(@Query('taxon') taxon: string) {
    return this.publicApiV2Service.getSpecies(taxon);
  }

  @Post('observations')
  addObservation(@Body() observation: any, @Headers('X-API-KEY') apiKey: string) {
    this.publicApiV2Service.validateApiKey(apiKey);
    return this.publicApiV2Service.addObservation(observation);
  }

  // API Key management endpoints
  @Get('api-keys')
  @UseGuards(JwtAuthGuard)
  getApiKeys() {
    return API_KEYS.map(k => ({ ...k, key: k.key.slice(0, 8) + '••••••••••••••••••••••••' }));
  }

  @Post('api-keys')
  @UseGuards(JwtAuthGuard)
  createApiKey(@Body() body: { name: string; scopes: string[]; expiresIn?: string }) {
    const key = `lftg_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = body.expiresIn && body.expiresIn !== '0'
      ? new Date(Date.now() + parseInt(body.expiresIn) * 86400000).toISOString()
      : null;
    const entry = {
      id: crypto.randomUUID(),
      name: body.name,
      key,
      scopes: body.scopes ?? [],
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    API_KEYS.push(entry);
    return entry; // Return full key only on creation
  }

  @Delete('api-keys/:id')
  @UseGuards(JwtAuthGuard)
  deleteApiKey(@Param('id') id: string) {
    const idx = API_KEYS.findIndex(k => k.id === id);
    if (idx !== -1) API_KEYS.splice(idx, 1);
    return { deleted: true, id };
  }
}
