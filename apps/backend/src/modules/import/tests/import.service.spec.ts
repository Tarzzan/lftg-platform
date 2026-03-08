import { Test, TestingModule } from '@nestjs/testing';
import { ImportService } from '../import.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ImportService', () => {
  let service: ImportService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ImportService>(ImportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
