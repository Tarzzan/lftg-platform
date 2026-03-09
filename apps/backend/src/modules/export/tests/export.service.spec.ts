import { Test, TestingModule } from '@nestjs/testing';
import { ExportService } from '../export.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ExportService', () => {
  let service: ExportService;
  const mockPrisma = {
    stockItem: {
      findMany: jest.fn().mockResolvedValue([
        { id: '1', name: 'Crickets', category: 'Nourriture', quantity: 500, unit: 'g', lowStockThreshold: 100 },
      ]),
    },
    animal: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'a1', identifier: 'JAG-001', name: 'Simba', sex: 'M', birthDate: new Date('2020-01-01'),
          status: 'ALIVE', species: { name: 'Jaguar' }, enclosure: { name: 'Fauve' },
        },
      ]),
    },
    employee: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'e1', firstName: 'Jean', lastName: 'Dupont', email: 'j@lftg.fr',
          phone: '0600000000', jobTitle: 'Soigneur', department: 'Animaux',
          hireDate: new Date('2022-06-01'), skills: [{ name: 'Reptiles' }],
        },
      ]),
    },
    course: { findMany: jest.fn().mockResolvedValue([]) },
    auditLog: { findMany: jest.fn().mockResolvedValue([]) },
  };

  const mockResponse = {
    header: jest.fn(),
    attachment: jest.fn(),
    pipe: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ExportService>(ExportService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('exportStockCsv() should query stockItems from Prisma', async () => {
    await service.exportStockCsv(mockResponse).catch(() => {});
    expect(mockPrisma.stockItem.findMany).toHaveBeenCalled();
  });

  it('exportAnimauxCsv() should query animals from Prisma', async () => {
    await service.exportAnimauxCsv(mockResponse).catch(() => {});
    expect(mockPrisma.animal.findMany).toHaveBeenCalled();
  });

  it('exportPersonnelCsv() should query employees from Prisma', async () => {
    await service.exportPersonnelCsv(mockResponse).catch(() => {});
    expect(mockPrisma.employee.findMany).toHaveBeenCalled();
  });

  it('exportFormationCsv() should query courses from Prisma', async () => {
    await service.exportFormationCsv(mockResponse).catch(() => {});
    expect(mockPrisma.course.findMany).toHaveBeenCalled();
  });

  it('exportAuditCsv() should query auditLogs from Prisma', async () => {
    await service.exportAuditCsv(mockResponse).catch(() => {});
    expect(mockPrisma.auditLog.findMany).toHaveBeenCalled();
  });
});
