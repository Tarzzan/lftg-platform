import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VentesService, CreateSaleDto, UpdateSaleDto, SaleStatus, SaleType } from './ventes.service';

@ApiTags('Ventes')
@ApiBearerAuth()
@Controller('ventes')
@UseGuards(JwtAuthGuard)
export class VentesController {
  constructor(private readonly ventesService: VentesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les ventes avec filtres et pagination' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED'] })
  @ApiQuery({ name: 'type', required: false, enum: ['ANIMAL', 'PRODUCT', 'SERVICE', 'FORMATION'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('status') status?: SaleStatus,
    @Query('type') type?: SaleType,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ventesService.findAll({
      status, type, search, dateFrom, dateTo,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des ventes par période' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'year'] })
  getStats(@Query('period') period?: 'week' | 'month' | 'year') {
    return this.ventesService.getStats(period);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une vente' })
  findOne(@Param('id') id: string) {
    return this.ventesService.findOne(id);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Générer la facture HTML d\'une vente' })
  async getInvoice(@Param('id') id: string, @Res() res: Response) {
    const html = await this.ventesService.generateInvoiceHtml(id);
    const sale = await this.ventesService.findOne(id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="facture-${(sale as any).reference}.html"`);
    res.send(html);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle vente' })
  create(@Body() dto: CreateSaleDto, @Request() req: any) {
    return this.ventesService.create(dto, req.user.id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une vente' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateSaleDto, @Request() req: any) {
    return this.ventesService.updateStatus(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Annuler une vente' })
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.ventesService.cancel(id, req.user.id);
  }
}
