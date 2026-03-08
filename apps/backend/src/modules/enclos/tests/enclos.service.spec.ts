import { Test, TestingModule } from '@nestjs/testing';
import { EnclosService } from '../enclos.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('EnclosService', () => {
  let service: EnclosService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnclosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<EnclosService>(EnclosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
