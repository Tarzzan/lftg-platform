import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from '../search.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SearchService', () => {
  let service: SearchService;
  const mockPrisma = {
    animal: { findMany: jest.fn().mockResolvedValue([]) },
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
});
