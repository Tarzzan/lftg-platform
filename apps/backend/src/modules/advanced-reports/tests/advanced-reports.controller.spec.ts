import { Test, TestingModule } from '@nestjs/testing';
import { Advanced-reportsController } from '../advanced-reports.controller';

describe('Advanced-reportsController', () => {
  let controller: Advanced-reportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Advanced-reportsController],
    }).compile();

    controller = module.get<Advanced-reportsController>(Advanced-reportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
