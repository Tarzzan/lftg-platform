import { Test, TestingModule } from '@nestjs/testing';
import { MeteoService } from '../meteo.service';

describe('MeteoService', () => {
  let service: MeteoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeteoService],
    }).compile();
    service = module.get<MeteoService>(MeteoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getCurrentWeather() should return weather data', async () => {
    const result = await service.getCurrentWeather();
    expect(result).toBeDefined();
    expect(result.location).toBeDefined();
    expect(typeof result.temperature).toBe('number');
  });

  it('getForecast() should return an array', async () => {
    const result = await service.getForecast(7);
    expect(Array.isArray(result)).toBe(true);
  });

  it('getAlerts() should return an array', async () => {
    const result = await service.getAlerts();
    expect(Array.isArray(result)).toBe(true);
  });
});
