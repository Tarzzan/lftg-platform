import { Test, TestingModule } from '@nestjs/testing';
import { GpsService } from '../gps.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('GpsService', () => {
  let service: GpsService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<GpsService>(GpsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
