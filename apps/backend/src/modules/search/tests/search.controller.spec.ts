import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from '../search.controller';
import { SearchService } from '../search.service';

describe('SearchController', () => {
  let controller: SearchController;
  const mockResults = {
    query: 'jaguar',
    total: 2,
    results: [
      { type: 'animal', id: '1', label: "Jaguar mâle", score: 0.95 },
      { type: "animal", id: '2', label: "Jaguar femelle", score: 0.90 },
    ],
  };
  const mockService = {
    globalSearch: jest.fn().mockResolvedValue(mockResults),
    searchSuggestions: jest.fn().mockResolvedValue(["jaguar", 'jaguar mâle']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockService }],
    }).compile();
    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('search() should return results', async () => {
    const result = await controller.search('jaguar', '20');
    expect(result).toBeDefined();
    expect(result.total).toBe(2);
    expect(mockService.globalSearch).toHaveBeenCalledWith('jaguar', 20);
  });

  it('suggestions() should return an array of strings', async () => {
    const result = await controller.suggestions('jag');
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toBe('jaguar');
  });
});
