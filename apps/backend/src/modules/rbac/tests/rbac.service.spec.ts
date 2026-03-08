import { Test, TestingModule } from '@nestjs/testing';
import { RbacService } from '../rbac.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('RbacService', () => {
  let service: RbacService;
  const mockPrisma = {
    role: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: '1', name: 'TEST', permissions: [] }),
      delete: jest.fn().mockResolvedValue({ id: '1' }),
    },
    permission: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'p1', action: 'read', subject: 'Animal' }),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<RbacService>(RbacService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAllRoles() should return an array', async () => {
    const result = await service.findAllRoles();
    expect(Array.isArray(result)).toBe(true);
  });

  it('findAllPermissions() should return an array', async () => {
    const result = await service.findAllPermissions();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getUserPermissions() should return empty array for unknown user', async () => {
    const result = await service.getUserPermissions('unknown');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
