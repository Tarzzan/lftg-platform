// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from '../stats.controller';
import { StatsService } from '../stats.service';

const mockService = {
  getDashboardStats: jest.fn(),
  getAnimalsBySpecies: jest.fn(),
  getStockEvolution: jest.fn(),
  getWorkflowsByState: jest.fn(),
  getFormationProgress: jest.fn(),
};

describe('StatsController', () => {
  let controller: StatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [{ provide: StatsService, useValue: mockService }],
    }).compile();
    controller = module.get<StatsController>(StatsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return dashboard statistics', async () => {
      const stats = {
        animals: { alive: 42, species: 8, activeBroods: 3 },
        stock: { total: 120, lowStock: 5 },
        workflows: { total: 15 },
        hr: { employees: 7 },
        formation: { courses: 12 },
      };
      mockService.getDashboardStats.mockResolvedValue(stats);
      expect(await controller.getDashboard()).toEqual(stats);
    });

    it('should handle empty database', async () => {
      const empty = {
        animals: { alive: 0, species: 0, activeBroods: 0 },
        stock: { total: 0, lowStock: 0 },
        workflows: { total: 0 },
        hr: { employees: 0 },
        formation: { courses: 0 },
      };
      mockService.getDashboardStats.mockResolvedValue(empty);
      const result = await controller.getDashboard();
      expect(result.animals.alive).toBe(0);
    });
  });

  describe('getAnimalsBySpecies', () => {
    it('should return animals grouped by species', async () => {
      const data = [
        { speciesId: '1', name: 'Perroquet', count: 12 },
        { speciesId: '2', name: 'Tortue', count: 5 },
      ];
      mockService.getAnimalsBySpecies.mockResolvedValue(data);
      expect(await controller.getAnimalsBySpecies()).toEqual(data);
    });

    it('should return empty array when no animals', async () => {
      mockService.getAnimalsBySpecies.mockResolvedValue([]);
      expect(await controller.getAnimalsBySpecies()).toEqual([]);
    });
  });

  describe('getStockEvolution', () => {
    it('should return stock evolution with default 30 days', async () => {
      const evolution = [{ date: '2026-03-01', entrees: 10, sorties: 5 }];
      mockService.getStockEvolution.mockResolvedValue(evolution);
      await controller.getStockEvolution(undefined);
      expect(mockService.getStockEvolution).toHaveBeenCalledWith(30);
    });

    it('should use custom days parameter', async () => {
      mockService.getStockEvolution.mockResolvedValue([]);
      await controller.getStockEvolution('7');
      expect(mockService.getStockEvolution).toHaveBeenCalledWith(7);
    });

    it('should return evolution data', async () => {
      const data = [{ date: '2026-03-09', entrees: 20, sorties: 8 }];
      mockService.getStockEvolution.mockResolvedValue(data);
      expect(await controller.getStockEvolution('1')).toEqual(data);
    });
  });

  describe('getWorkflowsByState', () => {
    it('should return workflows grouped by state', async () => {
      const data = [
        { state: 'pending', label: 'En attente', count: 5 },
        { state: 'completed', label: 'Terminé', count: 10 },
      ];
      mockService.getWorkflowsByState.mockResolvedValue(data);
      expect(await controller.getWorkflowsByState()).toEqual(data);
    });
  });

  describe('getFormationProgress', () => {
    it('should return formation enrollment progress', async () => {
      const data = [
        { status: 'completed', count: 8 },
        { status: 'in_progress', count: 4 },
      ];
      mockService.getFormationProgress.mockResolvedValue(data);
      expect(await controller.getFormationProgress()).toEqual(data);
    });
  });

  describe('getAnimalsBySpeciesId', () => {
    it('should return animals for a specific species', async () => {
      const data = [{ speciesId: '1', name: 'Perroquet', count: 12 }];
      mockService.getAnimalsBySpecies.mockResolvedValue(data);
      expect(await controller.getAnimalsBySpeciesId('1')).toEqual(data);
      expect(mockService.getAnimalsBySpecies).toHaveBeenCalled();
    });
  });
});
