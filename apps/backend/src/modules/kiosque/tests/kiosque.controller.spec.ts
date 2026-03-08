import { Test, TestingModule } from '@nestjs/testing';
import { KiosqueController } from '../kiosque.controller';
import { KiosqueService } from '../kiosque.service';

describe('KiosqueController', () => {
  let controller: KiosqueController;
  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KiosqueController],
      providers: [{ provide: KiosqueService, useValue: mockService }],
    }).compile();
    controller = module.get<KiosqueController>(KiosqueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
