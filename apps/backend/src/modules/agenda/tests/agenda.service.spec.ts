import { Test, TestingModule } from '@nestjs/testing';
import { AgendaService } from '../agenda.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AgendaService', () => {
  let service: AgendaService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AgendaService>(AgendaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
