import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

export interface DocumentMetaDto {
  title: string;
  type: 'CITES_PERMIT' | 'HEALTH_CERTIFICATE' | 'INVOICE' | 'CONTRACT' | 'PHOTO' | 'XRAY' | 'LAB_RESULT' | 'OTHER';
  entityType: 'ANIMAL' | 'SALE' | 'MEDICAL_VISIT' | 'ENCLOSURE' | 'USER';
  entityId: string;
  description?: string;
  expiresAt?: string;
  tags?: string[];
}

@Injectable()
export class DocumentsService {
  private readonly uploadDir = process.env.UPLOAD_DIR || '/tmp/lftg-uploads';

  constructor(private prisma: PrismaService) {
    // Créer le répertoire d'upload si nécessaire
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveDocument(file: Express.Multer.File, meta: DocumentMetaDto, uploadedById: string) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    // Sauvegarder le fichier
    fs.writeFileSync(filePath, file.buffer);

    const doc = await this.prisma.document.create({
      data: {
        title: meta.title,
        type: meta.type,
        entityType: meta.entityType,
        entityId: meta.entityId,
        description: meta.description,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        expiresAt: meta.expiresAt ? new Date(meta.expiresAt) : null,
        tags: meta.tags || [],
        uploadedById,
      },
    });

    return doc;
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

  async getDocumentFile(id: string): Promise<{ path: string; mimeType: string; filename: string }> {
    const doc = await this.getDocumentById(id);
    if (!fs.existsSync(doc.path)) {
      throw new NotFoundException('Fichier introuvable sur le serveur');
    }
    return { path: doc.path, mimeType: doc.mimeType, filename: doc.originalName };
  }

  async deleteDocument(id: string) {
    const doc = await this.getDocumentById(id);
    // Supprimer le fichier physique
    if (fs.existsSync(doc.path)) {
      fs.unlinkSync(doc.path);
    }
    return this.prisma.document.delete({ where: { id } });
  }

  async getExpiringDocuments(daysAhead = 30) {
    const future = new Date();
    future.setDate(future.getDate() + daysAhead);

    return this.prisma.document.findMany({
      where: {
        expiresAt: { lte: future, gte: new Date() },
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async searchDocuments(query: string) {
    return this.prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { originalName: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getDocumentStats() {
    const [total, byType, expiringSoon] = await Promise.all([
      this.prisma.document.count(),
      this.prisma.document.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      this.getExpiringDocuments(30),
    ]);

    return {
      total,
      byType: byType.map(t => ({ type: t.type, count: t._count.id })),
      expiringSoon: expiringSoon.length,
    };
  }
}
