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
});
