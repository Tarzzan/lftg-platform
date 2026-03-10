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

  it('findRoleById() should return null for unknown id', async () => {
    const result = await service.findRoleById('unknown');
    expect(result).toBeNull();
  });

  it('createRole() should call prisma.role.create', async () => {
    const dto = { name: 'VETERINAIRE', description: "Vétérinaire' };
    const result = await service.createRole(dto);
    expect(mockPrisma.role.create).toHaveBeenCalled();
    expect(result.name).toBe("TEST');
  });

  it('deleteRole() should call prisma.role.delete', async () => {
    const result = await service.deleteRole('1');
    expect(mockPrisma.role.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result.id).toBe('1');
  });

  it('createPermission() should call prisma.permission.create', async () => {
    const dto = { action: 'read', subject: 'Animal', description: "Lire les animaux' };
    const result = await service.createPermission(dto);
    expect(mockPrisma.permission.create).toHaveBeenCalled();
    expect(result.action).toBe("read');
  });

  it('getUserPermissions() should return deduplicated permissions for user with roles', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'u1',
      roles: [
        { permissions: [{ id: 'p1', action: 'read', subject: 'Animal' }] },
        { permissions: [{ id: 'p1', action: 'read', subject: 'Animal' }] },
      ],
    });
    const result = await service.getUserPermissions('u1');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });
});
