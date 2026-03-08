import { Test, TestingModule } from '@nestjs/testing';
import { CitesApiController } from '../cites-api.controller';
import { CitesApiService } from '../cites-api.service';

describe('CitesApiController', () => {
  let controller: CitesApiController;
  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitesApiController],
      providers: [{ provide: CitesApiService, useValue: mockService }],
    }).compile();
    controller = module.get<CitesApiController>(CitesApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
