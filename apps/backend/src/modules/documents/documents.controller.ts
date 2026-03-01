import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DocumentsService, DocumentMetaDto } from './documents.service';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Rechercher des documents' })
  async search(@Query('q') q: string) {
    return this.documentsService.searchDocuments(q || '');
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des documents' })
  async getStats() {
    return this.documentsService.getDocumentStats();
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Documents expirant bientôt' })
  async getExpiring(@Query('daysAhead') daysAhead?: string) {
    return this.documentsService.getExpiringDocuments(daysAhead ? parseInt(daysAhead) : 30);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Documents d\'une entité' })
  async getByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.documentsService.getDocumentsByEntity(entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un document' })
  async getDocument(@Param('id') id: string) {
    return this.documentsService.getDocumentById(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Télécharger un document' })
  async downloadDocument(@Param('id') id: string, @Res() res: Response) {
    const { path, mimeType, filename } = await this.documentsService.getDocumentFile(id);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Uploader un document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Type de fichier non autorisé'), false);
      }
    },
  }))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() meta: DocumentMetaDto,
    @Request() req: any,
  ) {
    return this.documentsService.saveDocument(file, meta, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un document' })
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }
}
