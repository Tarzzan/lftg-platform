import { Test, TestingModule } from '@nestjs/testing';
import { KiosqueService } from '../kiosque.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('KiosqueService', () => {
  let service: KiosqueService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KiosqueService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<KiosqueService>(KiosqueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
