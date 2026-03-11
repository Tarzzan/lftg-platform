import { Test, TestingModule } from '@nestjs/testing';
import { PluginRegistryService } from '../plugin-registry.service';

describe('PluginRegistryService', () => {
  let service: PluginRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PluginRegistryService],
    }).compile();
    service = module.get<PluginRegistryService>(PluginRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getAllPlugins() should return an array', () => {
    const result = service.getAllPlugins();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getMenuEntries() should return an array', () => {
    const result = service.getMenuEntries([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('registerPlugin() should add plugin to registry', () => {
    const manifest = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      permissions: [{ action: 'read', subject: 'Animal' }],
      menuEntries: [{ label: 'Test', path: '/test', roles: ['ADMIN'] }],
    };
    service.registerPlugin(manifest);
    const plugins = service.getAllPlugins();
    expect(plugins.some((p) => p.id === 'test-plugin')).toBe(true);
  });

  it('getPlugin() should return plugin by id', () => {
    const manifest = {
      id: 'plugin-xyz',
      name: 'XYZ Plugin',
      version: '2.0.0',
      permissions: [],
    };
    service.registerPlugin(manifest);
    const found = service.getPlugin('plugin-xyz');
    expect(found).toBeDefined();
    expect(found?.name).toBe('XYZ Plugin');
  });

  it('getPlugin() should return undefined for unknown id', () => {
    const result = service.getPlugin('unknown-plugin');
    expect(result).toBeUndefined();
  });

  it('getMenuEntries() should filter by role', () => {
    service.registerPlugin({
      id: 'role-plugin',
      name: 'Role Plugin',
      version: '1.0.0',
      permissions: [],
      menuEntries: [
        { label: 'Admin Only', path: '/admin', roles: ['ADMIN'] },
        { label: 'Public', path: '/public' },
      ],
    });
    const adminEntries = service.getMenuEntries(['ADMIN']);
    const publicEntries = service.getMenuEntries(['USER']);
    expect(adminEntries.some((e) => e.label === 'Admin Only')).toBe(true);
    expect(publicEntries.some((e) => e.label === 'Public')).toBe(true);
    expect(publicEntries.some((e) => e.label === 'Admin Only')).toBe(false);
  });

  it('getPermissions() should return all plugin permissions', () => {
    service.registerPlugin({
      id: 'perm-plugin',
      name: 'Perm Plugin',
      version: '1.0.0',
      permissions: [{ action: 'write', subject: 'Enclosure' }],
    });
    const perms = service.getPermissions();
    expect(Array.isArray(perms)).toBe(true);
    expect(perms.some((p) => p.subject === 'Enclosure')).toBe(true);
  });
});
