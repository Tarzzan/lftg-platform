import { Test, TestingModule } from '@nestjs/testing';
import { ElevageController } from '../elevage.controller';
import { ElevageService } from '../elevage.service';

describe('ElevageController', () => {
  let controller: ElevageController;
  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElevageController],
      providers: [{ provide: ElevageService, useValue: mockService }],
    }).compile();
    controller = module.get<ElevageController>(ElevageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
