import { Test, TestingModule } from '@nestjs/testing';
import { ExportService } from '../export.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ExportService', () => {
  let service: ExportService;
  const mockPrisma = {
    stockItem: { findMany: jest.fn().mockResolvedValue([]) },
    animal: { findMany: jest.fn().mockResolvedValue([]) },
    employee: { findMany: jest.fn().mockResolvedValue([]) },
    course: { findMany: jest.fn().mockResolvedValue([]) },
    auditLog: { findMany: jest.fn().mockResolvedValue([]) },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ExportService>(ExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
