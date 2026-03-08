import { Test, TestingModule } from '@nestjs/testing';
import { MedicalService } from '../medical.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MedicalService', () => {
  let service: MedicalService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<MedicalService>(MedicalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
