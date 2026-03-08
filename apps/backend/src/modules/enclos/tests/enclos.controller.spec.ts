import { Test, TestingModule } from '@nestjs/testing';
import { EnclosController } from '../enclos.controller';
import { EnclosService } from '../enclos.service';

describe('EnclosController', () => {
  let controller: EnclosController;
  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnclosController],
      providers: [{ provide: EnclosService, useValue: mockService }],
    }).compile();
    controller = module.get<EnclosController>(EnclosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
