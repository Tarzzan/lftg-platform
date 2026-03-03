import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DocumentMetaDto {
  name: string;
  type?: string;
  entityType?: string;
  entityId?: string;
  url: string;
  mimeType?: string;
  size?: number;
}

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async saveDocument(meta: DocumentMetaDto, uploadedById: string) {
    return this.prisma.document.create({
      data: {
        name: meta.name,
        type: meta.type || 'OTHER',
        entityType: meta.entityType,
        entityId: meta.entityId,
        url: meta.url,
        mimeType: meta.mimeType,
        size: meta.size,
        uploadedById,
      },
    });
  }

  async getDocumentsByEntity(entityType: string, entityId: string) {
    return this.prisma.document.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentById(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException(`Document ${id} introuvable`);
    return doc;
  }

  async getAllDocuments(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { name: true, email: true } } },
      }),
      this.prisma.document.count(),
    ]);
    return { items, total, page, limit };
  }

  async deleteDocument(id: string) {
    await this.getDocumentById(id);
    return this.prisma.document.delete({ where: { id } });
  }

  async searchDocuments(query: string) {
    return this.prisma.document.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getDocumentStats() {
    const [total, byType] = await Promise.all([
      this.prisma.document.count(),
      this.prisma.document.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
    ]);
    return {
      total,
      byType: byType.map((t) => ({ type: t.type, count: t._count.id })),
    };
  }
}
