import { Test, TestingModule } from '@nestjs/testing';
import { DemoService } from '../demo.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DemoService', () => {
  let service: DemoService;
  const mockPrisma = {
    agendaEvent: {
      deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
      count: jest.fn().mockResolvedValue(5),
    },
    historyLog: {
      deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
      count: jest.fn().mockResolvedValue(3),
    },
    mlPrediction: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    iotReading: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    gpsTrack: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    alert: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    alertRule: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    meal: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    nutritionPlan: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    sponsorship: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    sponsor: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<DemoService>(DemoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getDemoStatus() should return isDemoMode and demoDataCount', async () => {
    const result = await service.getDemoStatus();
    expect(result).toHaveProperty('isDemoMode');
    expect(result).toHaveProperty('demoDataCount');
    expect(typeof result.demoDataCount).toBe('number');
    expect(result.demoDataCount).toBe(8); // 5 + 3
  });

  it('clearDemoData() should return deleted counts object', async () => {
    const result = await service.clearDemoData();
    expect(result).toHaveProperty('deleted');
    expect(typeof result.deleted).toBe('object');
    expect(result.deleted['AgendaEvent']).toBe(5);
    expect(result.deleted['HistoryLog']).toBe(3);
  });

  it('clearDemoData() should call deleteMany for demo tables', async () => {
    await service.clearDemoData();
    expect(mockPrisma.agendaEvent.deleteMany).toHaveBeenCalled();
    expect(mockPrisma.historyLog.deleteMany).toHaveBeenCalled();
  });
});
