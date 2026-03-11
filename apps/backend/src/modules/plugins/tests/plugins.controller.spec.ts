import { Test, TestingModule } from '@nestjs/testing';
import { PluginsController } from '../plugins.controller';
import { PluginRegistryService } from '../plugin-registry.service';

describe('PluginsController', () => {
  let controller: PluginsController;
  const mockRegistry = {
    getAllPlugins: jest.fn().mockReturnValue([
      { id: 'cites', name: 'CITES', version: '1.0.0', enabled: true },
      { id: 'gbif', name: 'GBIF', version: '1.0.0', enabled: true },
    ]),
    getMenuEntries: jest.fn().mockReturnValue([
      { label: 'CITES', path: '/admin/cites', icon: 'shield' },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PluginsController],
      providers: [{ provide: PluginRegistryService, useValue: mockRegistry }],
    }).compile();
    controller = module.get<PluginsController>(PluginsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll() should return all plugins', () => {
    const result = controller.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('getMenu() should return menu entries', () => {
    const result = controller.getMenu();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('label');
  });
});
