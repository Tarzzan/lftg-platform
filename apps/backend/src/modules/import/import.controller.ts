import {
  Controller, Post, Get, Param, Body, UseGuards,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('import')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Get('template/:type')
  @Permissions('import:read')
  getTemplate(@Param('type') type: 'animals' | 'stock' | 'users') {
    const csv = this.importService.getTemplate(type);
    return { type, csv, filename: `template-${type}.csv` };
  }

  @Post('animals')
  @Permissions('import:write')
  @UseInterceptors(FileInterceptor('file'))
  async importAnimals(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('Fichier CSV requis');
    const content = file.buffer.toString('utf-8');
    return this.importService.importAnimals(content, user.id);
  }

  @Post('stock')
  @Permissions('import:write')
  @UseInterceptors(FileInterceptor('file'))
  async importStock(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('Fichier CSV requis');
    const content = file.buffer.toString('utf-8');
    return this.importService.importStockArticles(content, user.id);
  }

  @Post('users')
  @Permissions('admin:import')
  @UseInterceptors(FileInterceptor('file'))
  async importUsers(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('Fichier CSV requis');
    const content = file.buffer.toString('utf-8');
    return this.importService.importUsers(content, user.id);
  }

  // Import depuis le corps de la requête (pour les tests)
  @Post('animals/raw')
  @Permissions('import:write')
  async importAnimalsRaw(@Body() dto: { csv: string }, @CurrentUser() user: any) {
    return this.importService.importAnimals(dto.csv, user.id);
  }

  @Post('stock/raw')
  @Permissions('import:write')
  async importStockRaw(@Body() dto: { csv: string }, @CurrentUser() user: any) {
    return this.importService.importStockArticles(dto.csv, user.id);
  }
}
