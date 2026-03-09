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

  it('getMetrics() should return an array of metrics', () => {
    const result = service.getMetrics();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('getMetrics() each metric should have required fields', () => {
    const metrics = service.getMetrics();
    metrics.forEach((m) => {
      expect(m).toHaveProperty('key');
      expect(m).toHaveProperty('label');
      expect(m).toHaveProperty('value');
      expect(m).toHaveProperty('unit');
      expect(m).toHaveProperty('trend');
      expect(m).toHaveProperty('category');
    });
  });

  it('getMetrics() should include animals_total metric', () => {
    const metrics = service.getMetrics();
    const animalsTotal = metrics.find((m) => m.key === 'animals_total');
    expect(animalsTotal).toBeDefined();
    expect(typeof animalsTotal?.value).toBe('number');
  });

  it('getLiveEvents() should return an array', () => {
    const result = service.getLiveEvents();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getLiveEvents() each event should have required fields', () => {
    const events = service.getLiveEvents();
    if (events.length > 0) {
      events.forEach((e) => {
        expect(e).toHaveProperty('id');
        expect(e).toHaveProperty('type');
        expect(e).toHaveProperty('title');
        expect(e).toHaveProperty('severity');
      });
    }
  });

  it('getEnvironmentData() should return an array', () => {
    const result = service.getEnvironmentData();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getEnvironmentData() each zone should have required fields', () => {
    const zones = service.getEnvironmentData();
    if (zones.length > 0) {
      zones.forEach((z) => {
        expect(z).toHaveProperty('zone');
        expect(z).toHaveProperty('temperature');
        expect(z).toHaveProperty('humidity');
      });
    }
  });
});
