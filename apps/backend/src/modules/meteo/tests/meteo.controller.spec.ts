import { Test, TestingModule } from '@nestjs/testing';
import { MeteoController } from '../meteo.controller';
import { MeteoService } from '../meteo.service';

describe('MeteoController', () => {
  let controller: MeteoController;
  const mockWeather = {
    location: 'Cayenne, Guyane',
    temperature: 28,
    feelsLike: 32,
    humidity: 85,
    pressure: 1012,
    windSpeed: 15,
    windDirection: 'NE',
    description: "Partiellement nuageux',
    icon: "02d',
    uvIndex: 9,
    visibility: 10,
    sunrise: '06:15',
    sunset: '18:30',
    alerts: [],
    forecast: [],
    animalImpact: [],
  };
  const mockService = {
    getCurrentWeather: jest.fn().mockResolvedValue(mockWeather),
    getForecast: jest.fn().mockResolvedValue([]),
    getAlerts: jest.fn().mockResolvedValue([]),
    getAnimalImpact: jest.fn().mockResolvedValue([]),
    getHistory: jest.fn().mockResolvedValue([]),
    getPublicWeather: jest.fn().mockResolvedValue(mockWeather),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeteoController],
      providers: [{ provide: MeteoService, useValue: mockService }],
    }).compile();
    controller = module.get<MeteoController>(MeteoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getCurrentWeather() should return weather data', async () => {
    const result = await controller.getCurrentWeather();
    expect(result).toBeDefined();
    expect(result.location).toBe('Cayenne, Guyane');
  });

  it('getAlerts() should return an array', async () => {
    const result = await controller.getAlerts();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getForecast() should call service.getForecast', async () => {
    const result = await controller.getForecast('7');
    expect(mockService.getForecast).toHaveBeenCalledWith(7);
    expect(Array.isArray(result)).toBe(true);
  });

  it('getAnimalImpact() should call service.getAnimalImpact', async () => {
    const result = await controller.getAnimalImpact();
    expect(mockService.getAnimalImpact).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getHistory() should call service.getHistory', async () => {
    const result = await controller.getHistory('30');
    expect(mockService.getHistory).toHaveBeenCalledWith(30);
    expect(Array.isArray(result)).toBe(true);
  });

  it('getPublicWeather() should return weather data', async () => {
    const result = await controller.getPublicWeather();
    expect(result).toBeDefined();
    expect(result.location).toBe('Cayenne, Guyane');
  });
});
