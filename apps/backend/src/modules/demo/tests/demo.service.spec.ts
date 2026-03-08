import { Test, TestingModule } from '@nestjs/testing';
import { DemoService } from '../demo.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DemoService', () => {
  let service: DemoService;
  const mockPrisma = {
    agendaEvent: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    historyLog: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<DemoService>(DemoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
