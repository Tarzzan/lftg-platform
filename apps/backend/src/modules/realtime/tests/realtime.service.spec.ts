import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeService } from '../realtime.service';

describe('RealtimeService', () => {
  let service: RealtimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtimeService],
    }).compile();
    service = module.get<RealtimeService>(RealtimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getMetrics() should return metrics object', () => {
    const result = service.getMetrics();
    expect(result).toBeDefined();
    expect(typeof result.animauxActifs).toBe('number');
  });

  it('getLiveEvents() should return an array', () => {
    const result = service.getLiveEvents();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getEnvironmentData() should return an array', () => {
    const result = service.getEnvironmentData();
    expect(Array.isArray(result)).toBe(true);
  });
});
