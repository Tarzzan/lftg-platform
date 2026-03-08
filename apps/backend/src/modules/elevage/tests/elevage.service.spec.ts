import { Test, TestingModule } from '@nestjs/testing';
import { ElevageService } from '../elevage.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ElevageService', () => {
  let service: ElevageService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElevageService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ElevageService>(ElevageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
