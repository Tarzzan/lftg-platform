import { Test, TestingModule } from '@nestjs/testing';
import { GbifController } from '../gbif.controller';
import { GbifService } from '../gbif.service';

describe('GbifController', () => {
  let controller: GbifController;
  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GbifController],
      providers: [{ provide: GbifService, useValue: mockService }],
    }).compile();
    controller = module.get<GbifController>(GbifController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
