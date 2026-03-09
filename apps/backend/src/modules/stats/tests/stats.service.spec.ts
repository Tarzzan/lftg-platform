// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from '../stats.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  animal: { count: jest.fn(), groupBy: jest.fn() },
  species: { count: jest.fn(), findMany: jest.fn() },
  brood: { count: jest.fn() },
  stockItem: { findMany: jest.fn() },
  stockMovement: { findMany: jest.fn() },
  employee: { count: jest.fn() },
  course: { count: jest.fn() },
  workflowInstance: { count: jest.fn(), groupBy: jest.fn() },
  enrollment: { count: jest.fn() },
};

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<StatsService>(StatsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardStats', () => {
    it('should return aggregated dashboard statistics', async () => {
      mockPrisma.animal.count.mockResolvedValue(42);
      mockPrisma.species.count.mockResolvedValue(8);
      mockPrisma.brood.count.mockResolvedValue(3);
      mockPrisma.stockItem.findMany.mockResolvedValue([
        { quantity: 5, lowStockThreshold: 10 },
        { quantity: 20, lowStockThreshold: 5 },
      ]);
      mockPrisma.employee.count.mockResolvedValue(7);
      mockPrisma.course.count.mockResolvedValue(12);
      mockPrisma.workflowInstance.count.mockResolvedValue(15);

      const result = await service.getDashboardStats();
      expect(result.animals.alive).toBe(42);
      expect(result.animals.species).toBe(8);
      expect(result.animals.activeBroods).toBe(3);
      expect(result.stock.total).toBe(2);
      expect(result.stock.lowStock).toBe(1); // only first item is below threshold
      expect(result.hr.employees).toBe(7);
      expect(result.formation.courses).toBe(12);
    });

    it('should handle workflowInstance count error gracefully', async () => {
      mockPrisma.animal.count.mockResolvedValue(0);
      mockPrisma.species.count.mockResolvedValue(0);
      mockPrisma.brood.count.mockResolvedValue(0);
      mockPrisma.stockItem.findMany.mockResolvedValue([]);
      mockPrisma.employee.count.mockResolvedValue(0);
      mockPrisma.course.count.mockResolvedValue(0);
      mockPrisma.workflowInstance.count.mockRejectedValue(new Error('Table not found'));

      const result = await service.getDashboardStats();
      expect(result.workflows.total).toBe(0); // should fallback to 0
    });
  });

  describe('getAnimalsBySpecies', () => {
    it('should return animals grouped and sorted by species', async () => {
      mockPrisma.animal.groupBy.mockResolvedValue([
        { speciesId: 'sp1', _count: { id: 12 } },
        { speciesId: 'sp2', _count: { id: 5 } },
      ]);
      mockPrisma.species.findMany.mockResolvedValue([
        { id: 'sp1', name: 'Psittacus erithacus', commonName: 'Perroquet gris' },
        { id: 'sp2', name: 'Testudo hermanni', commonName: 'Tortue d\'Hermann' },
      ]);

      const result = await service.getAnimalsBySpecies();
      expect(result).toHaveLength(2);
      expect(result[0].count).toBe(12); // sorted descending
      expect(result[0].name).toBe('Perroquet gris');
    });

    it('should use species name when commonName is null', async () => {
      mockPrisma.animal.groupBy.mockResolvedValue([
        { speciesId: 'sp1', _count: { id: 3 } },
      ]);
      mockPrisma.species.findMany.mockResolvedValue([
        { id: 'sp1', name: 'Iguana iguana', commonName: null },
      ]);

      const result = await service.getAnimalsBySpecies();
      expect(result[0].name).toBe('Iguana iguana');
    });
  });

  describe('getStockEvolution', () => {
    it('should return stock movements grouped by day', async () => {
      const now = new Date('2026-03-09T10:00:00Z');
      mockPrisma.stockMovement.findMany.mockResolvedValue([
        { timestamp: new Date('2026-03-07T08:00:00Z'), type: 'in', quantity: 10 },
        { timestamp: new Date('2026-03-07T14:00:00Z'), type: 'out', quantity: 3 },
        { timestamp: new Date('2026-03-08T09:00:00Z'), type: 'in', quantity: 5 },
      ]);

      const result = await service.getStockEvolution(30);
      expect(result).toHaveLength(2);
      const day07 = result.find(r => r.date === '2026-03-07');
      expect(day07.entrees).toBe(10);
      expect(day07.sorties).toBe(3);
    });

    it('should return empty array when no movements', async () => {
      mockPrisma.stockMovement.findMany.mockResolvedValue([]);
      const result = await service.getStockEvolution(7);
      expect(result).toEqual([]);
    });
  });

  describe('getWorkflowsByState', () => {
    it('should return workflows with French labels', async () => {
      mockPrisma.workflowInstance.groupBy.mockResolvedValue([
        { currentState: 'pending', _count: { id: 5 } },
        { currentState: 'completed', _count: { id: 10 } },
      ]);

      const result = await service.getWorkflowsByState();
      expect(result).toHaveLength(2);
      const pending = result.find(r => r.state === 'pending');
      expect(pending.label).toBe('En attente');
      expect(pending.count).toBe(5);
    });
  });

  describe('getFormationProgress', () => {
    it('should return completed vs in_progress enrollments', async () => {
      mockPrisma.enrollment.count
        .mockResolvedValueOnce(12)  // total
        .mockResolvedValueOnce(8);  // completed

      const result = await service.getFormationProgress();
      expect(result).toHaveLength(2);
      const completed = result.find(r => r.status === 'completed');
      const inProgress = result.find(r => r.status === 'in_progress');
      expect(completed.count).toBe(8);
      expect(inProgress.count).toBe(4);
    });
  });
});
