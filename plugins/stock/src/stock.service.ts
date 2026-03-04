import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../apps/backend/src/modules/prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  // --- Items ---
  async findAllItems() {
    const items = await this.prisma.stockItem.findMany({ orderBy: { name: 'asc' } });
    return items.map((item) => ({
      ...item,
      isLowStock: item.quantity <= item.lowStockThreshold,
    }));
  }

  async findItemById(id: string) {
    const item = await this.prisma.stockItem.findUnique({
      where: { id },
      include: { movements: { orderBy: { timestamp: 'desc' }, take: 20 } },
    });
    if (!item) throw new NotFoundException(`Article ${id} introuvable`);
    return item;
  }

  async createItem(data: { name: string; description?: string; unit: string; quantity?: number; lowStockThreshold?: number }) {
    return this.prisma.stockItem.create({ data });
  }

  async updateItem(id: string, data: Partial<{ name: string; description: string; unit: string; lowStockThreshold: number }>) {
    await this.findItemById(id);
    return this.prisma.stockItem.update({ where: { id }, data });
  }

  async deleteItem(id: string) {
    await this.findItemById(id);
    // Supprimer d'abord les mouvements et demandes liés
    await this.prisma.stockMovement.deleteMany({ where: { itemId: id } });
    await this.prisma.stockRequest.deleteMany({ where: { itemId: id } });
    await this.prisma.stockItem.delete({ where: { id } });
    return { deleted: true };
  }

  // --- Movements ---
  async recordMovement(data: { itemId: string; quantity: number; type: string; userId: string; notes?: string }) {
    const item = await this.prisma.stockItem.findUnique({ where: { id: data.itemId } });
    if (!item) throw new NotFoundException(`Article ${data.itemId} introuvable`);

    const newQty = item.quantity + data.quantity;
    if (newQty < 0) throw new BadRequestException('Stock insuffisant pour cette sortie');

    const [movement] = await this.prisma.$transaction([
      this.prisma.stockMovement.create({ data }),
      this.prisma.stockItem.update({ where: { id: data.itemId }, data: { quantity: newQty } }),
    ]);
    return movement;
  }

  async findMovements(itemId?: string) {
    return this.prisma.stockMovement.findMany({
      where: itemId ? { itemId } : undefined,
      include: { item: { select: { id: true, name: true, unit: true } } },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  // --- Requests (Workflow) ---
  async findAllRequests() {
    return this.prisma.stockRequest.findMany({
      include: { item: { select: { id: true, name: true, unit: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRequest(data: { itemId: string; quantity: number; reason?: string; requesterId: string }) {
    return this.prisma.stockRequest.create({ data });
  }

  async getLowStockAlerts() {
    const items = await this.prisma.stockItem.findMany();
    return items.filter((i) => i.quantity <= i.lowStockThreshold);
  }
}
