import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../../../apps/backend/src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../apps/backend/src/common/decorators/current-user.decorator';

@ApiTags('Plugin: Stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plugins/stock')
export class StockController {
  constructor(private service: StockService) {}

  @Get('items')
  @ApiOperation({ summary: 'Liste tous les articles en stock' })
  findAll() { return this.service.findAllItems(); }

  @Get('items/alerts')
  @ApiOperation({ summary: 'Articles en stock faible' })
  getAlerts() { return this.service.getLowStockAlerts(); }

  @Get('items/:id')
  findOne(@Param('id') id: string) { return this.service.findItemById(id); }

  @Post('items')
  @ApiOperation({ summary: 'Crée un article' })
  create(@Body() body: any) { return this.service.createItem(body); }

  @Patch('items/:id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.updateItem(id, body); }

  @Get('movements')
  @ApiOperation({ summary: 'Liste les mouvements de stock' })
  findMovements(@Query('itemId') itemId?: string) { return this.service.findMovements(itemId); }

  @Post('movements')
  @ApiOperation({ summary: 'Enregistre un mouvement de stock' })
  recordMovement(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.service.recordMovement({ ...body, userId });
  }

  @Get('requests')
  @ApiOperation({ summary: 'Liste les demandes de sortie stock' })
  findRequests() { return this.service.findAllRequests(); }

  @Post('requests')
  @ApiOperation({ summary: 'Crée une demande de sortie stock' })
  createRequest(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.service.createRequest({ ...body, requesterId: userId });
  }
}
