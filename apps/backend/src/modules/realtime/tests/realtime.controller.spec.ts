import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeController } from '../realtime.controller';
import { RealtimeService } from '../realtime.service';

describe('RealtimeController', () => {
  let controller: RealtimeController;
  const mockMetrics = {
    animauxActifs: 142,
    alertesActives: 3,
    temperatureMoyenne: 27.5,
    humiditeGlobale: 82,
    capteursFonctionnels: 18,
    capteursTotal: 20,
  };
  const mockService = {
    getMetrics: jest.fn().mockReturnValue(mockMetrics),
    getLiveEvents: jest.fn().mockReturnValue([]),
    getEnvironmentData: jest.fn().mockReturnValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RealtimeController],
      providers: [{ provide: RealtimeService, useValue: mockService }],
    }).compile();
    controller = module.get<RealtimeController>(RealtimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getMetrics() should return metrics', () => {
    const result = controller.getMetrics();
    expect(result).toBeDefined();
    expect(result.animauxActifs).toBe(142);
  });

  it('getEvents() should return an array', () => {
    const result = controller.getEvents();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getEnvironment() should return an array', () => {
    const result = controller.getEnvironment();
    expect(Array.isArray(result)).toBe(true);
  });
});
