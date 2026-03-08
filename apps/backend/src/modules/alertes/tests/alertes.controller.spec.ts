import { Test, TestingModule } from '@nestjs/testing';
import { AlertesController } from '../alertes.controller';
import { AlertesService } from '../alertes.service';

describe('AlertesController', () => {
  let controller: AlertesController;
  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertesController],
      providers: [{ provide: AlertesService, useValue: mockService }],
    }).compile();
    controller = module.get<AlertesController>(AlertesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
