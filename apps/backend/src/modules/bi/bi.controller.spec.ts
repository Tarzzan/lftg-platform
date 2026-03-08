import { Test, TestingModule } from '@nestjs/testing';
import { BiController } from './bi.controller';
import { BiService } from './bi.service';

describe('BiController', () => {
  let controller: BiController;
  const mockService = {
    getDashboard: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BiController],
      providers: [{ provide: BiService, useValue: mockService }],
    }).compile();
    controller = module.get<BiController>(BiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
