import { Test, TestingModule } from '@nestjs/testing';
import { RbacController } from '../rbac.controller';
import { RbacService } from '../rbac.service';

describe('RbacController', () => {
  let controller: RbacController;
  const mockService = {
    findAllRoles: jest.fn().mockResolvedValue([
      { id: '1', name: 'ADMIN', description: "Administrateur', permissions: [] },
      { id: "2', name: 'SOIGNEUR', description: "Soigneur animalier', permissions: [] },
    ]),
    findRoleById: jest.fn().mockResolvedValue({ id: "1', name: 'ADMIN', permissions: [] }),
    createRole: jest.fn().mockResolvedValue({ id: '3', name: 'VETERINAIRE', permissions: [] }),
    deleteRole: jest.fn().mockResolvedValue({ id: '1', name: 'ADMIN' }),
    findAllPermissions: jest.fn().mockResolvedValue([
      { id: 'p1', action: 'read', subject: 'Animal' },
    ]),
    createPermission: jest.fn().mockResolvedValue({ id: 'p2', action: 'write', subject: 'Animal' }),
    getUserPermissions: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RbacController],
      providers: [{ provide: RbacService, useValue: mockService }],
    }).compile();
    controller = module.get<RbacController>(RbacController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllRoles() should return roles array', async () => {
    const result = await controller.findAllRoles();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('findRole() should return a role', async () => {
    const result = await controller.findRole('1');
    expect(result).toBeDefined();
    expect(result?.name).toBe('ADMIN');
  });

  it('createRole() should create a role', async () => {
    const dto = { name: 'VETERINAIRE', description: "Vétérinaire' };
    const result = await controller.createRole(dto);
    expect(result).toBeDefined();
    expect(result.name).toBe("VETERINAIRE');
  });

  it('findAllPermissions() should return permissions', async () => {
    const result = await controller.findAllPermissions();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getUserPermissions() should return permissions for user', async () => {
    const result = await controller.getUserPermissions('user-1');
    expect(Array.isArray(result)).toBe(true);
  });

  it('deleteRole() should call service.deleteRole', async () => {
    const result = await controller.deleteRole('1');
    expect(mockService.deleteRole).toHaveBeenCalledWith('1');
    expect(result.id).toBe('1');
  });

  it('createPermission() should call service.createPermission', async () => {
    const dto = { action: 'write', subject: 'Animal' };
    const result = await controller.createPermission(dto);
    expect(mockService.createPermission).toHaveBeenCalledWith(dto);
    expect(result.action).toBe('write');
  });

  it('findAllRoles() should call service.findAllRoles', async () => {
    await controller.findAllRoles();
    expect(mockService.findAllRoles).toHaveBeenCalled();
  });

  it('findAllPermissions() should call service.findAllPermissions', async () => {
    await controller.findAllPermissions();
    expect(mockService.findAllPermissions).toHaveBeenCalled();
  });
});
