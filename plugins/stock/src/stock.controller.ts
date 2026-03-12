import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiConsumes } from '@nestjs/swagger';
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


  @Post('items/:id/image')
  @ApiOperation({ summary: 'Upload une image pour un article de stock' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'stock'),
      filename: (_req: any, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `stock-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (_req: any, file: any, cb: any) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Seules les images sont acceptées'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadItemImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    const imageUrl = `/uploads/stock/${file.filename}`;
    return this.service.updateItem(id, { imageUrl });
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Supprime un article' })
  remove(@Param('id') id: string) { return this.service.deleteItem(id); }

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
    const { priority, ...safeBody } = body;
    return this.service.createRequest({ ...safeBody, requesterId: userId });
  }
}
