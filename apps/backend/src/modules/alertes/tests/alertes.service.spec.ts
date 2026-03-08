import { Test, TestingModule } from '@nestjs/testing';
import { AlertesService } from '../alertes.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AlertesService', () => {
  let service: AlertesService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AlertesService>(AlertesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
