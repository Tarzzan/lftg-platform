import { Test, TestingModule } from '@nestjs/testing';
import { AdvancedReportsService } from '../advanced-reports.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AdvancedReportsService', () => {
  let service: AdvancedReportsService;

  const mockPrisma = {
    animal: {
      findMany: jest.fn().mockResolvedValue([
        { id: '1', name: 'Jaguar', species: { citesStatus: 'I' }, enclosure: { name: 'Fauve' } },
      ]),
      count: jest.fn().mockResolvedValue(42),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    species: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(10),
    },
    enclosure: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(5),
    },
    medicalRecord: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    sale: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvancedReportsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AdvancedReportsService>(AdvancedReportsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generateCitesReport() should return a Buffer', async () => {
    const result = await service.generateCitesReport();
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it('generateAnnualReport() should return a Buffer', async () => {
    const result = await service.generateAnnualReport(2024);
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });
});
