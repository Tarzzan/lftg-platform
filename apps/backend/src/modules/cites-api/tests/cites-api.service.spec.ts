import { Test, TestingModule } from '@nestjs/testing';
import { CitesApiService } from '../cites-api.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CitesApiService', () => {
  let service: CitesApiService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitesApiService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<CitesApiService>(CitesApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
