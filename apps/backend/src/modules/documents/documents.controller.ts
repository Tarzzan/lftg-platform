// @ts-nocheck
import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DocumentsService, DocumentMetaDto } from './documents.service';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: "Lister ou rechercher des documents" })
  async getAll(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (q) {
      return this.documentsService.searchDocuments(q);
    }
    return this.documentsService.getAllDocuments(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: "Statistiques des documents" })
  async getStats() {
    return this.documentsService.getDocumentStats();
  }

  @Get("entity/:entityType/:entityId")
  @ApiOperation({ summary: "Documents d'une entité" })
  async getByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.documentsService.getDocumentsByEntity(entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un document" })
  async getDocument(@Param('id') id: string) {
    return this.documentsService.getDocumentById(id);
  }

  @Post()
  @ApiOperation({ summary: "Créer un document (lien URL)" })
  async createDocument(@Body() meta: DocumentMetaDto, @Request() req: any) {
    return this.documentsService.saveDocument(meta, req.user?.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Supprimer un document" })
  async deleteDocument(@Param("id") id: string) {
    return this.documentsService.deleteDocument(id);
  }
}
