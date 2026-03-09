import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from '../search.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SearchService', () => {
  let service: SearchService;
  const mockPrisma = {
    animal: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'a1', name: 'Jaguar', identifier: 'JAG-001', status: 'ALIVE', notes: null, species: { commonName: 'Jaguar' } },
      ]),
    },
    species: { findMany: jest.fn().mockResolvedValue([]) },
    enclosure: { findMany: jest.fn().mockResolvedValue([]) },
    stockItem: { findMany: jest.fn().mockResolvedValue([]) },
    employee: { findMany: jest.fn().mockResolvedValue([]) },
    course: { findMany: jest.fn().mockResolvedValue([]) },
    user: { findMany: jest.fn().mockResolvedValue([]) },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('globalSearch() should return results object', async () => {
    const result = await service.globalSearch('test', 20);
    expect(result).toBeDefined();
    expect(typeof result.total).toBe('number');
  });

  it('searchSuggestions() should return an array', async () => {
    const result = await service.searchSuggestions('test');
    expect(Array.isArray(result)).toBe(true);
  });

  it('globalSearch() should return empty results for short query', async () => {
    const result = await service.globalSearch('a', 20);
    expect(result.results).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('globalSearch() should return empty results for empty query', async () => {
    const result = await service.globalSearch('', 20);
    expect(result.results).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('globalSearch() should query animals when query is long enough', async () => {
    await service.globalSearch('jaguar', 20);
    expect(mockPrisma.animal.findMany).toHaveBeenCalled();
  });

  it('globalSearch() results should have type, title, url fields', async () => {
    const result = await service.globalSearch('jaguar', 20);
    if (result.results.length > 0) {
      result.results.forEach((r) => {
        expect(r).toHaveProperty('id');
        expect(r).toHaveProperty('type');
        expect(r).toHaveProperty('title');
        expect(r).toHaveProperty('url');
      });
    }
  });

  it('globalSearch() total should match results length', async () => {
    const result = await service.globalSearch('jaguar', 20);
    expect(result.total).toBe(result.results.length);
  });
});
