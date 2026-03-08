import { Test, TestingModule } from '@nestjs/testing';
import { GbifService } from '../gbif.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('GbifService', () => {
  let service: GbifService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GbifService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<GbifService>(GbifService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
