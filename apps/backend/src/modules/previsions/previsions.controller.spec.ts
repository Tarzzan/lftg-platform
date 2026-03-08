import { Test, TestingModule } from '@nestjs/testing';
import { PrevisionsController } from './previsions.controller';
import { PrevisionsService } from './previsions.service';

describe('PrevisionsController', () => {
  let controller: PrevisionsController;
  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: '1' }),
    getStats: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrevisionsController],
      providers: [{ provide: PrevisionsService, useValue: mockService }],
    }).compile();
    controller = module.get<PrevisionsController>(PrevisionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
