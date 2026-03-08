import { Test, TestingModule } from '@nestjs/testing';
import { DemoController } from '../demo.controller';
import { DemoService } from '../demo.service';

describe('DemoController', () => {
  let controller: DemoController;
  const mockService = {
    getDemoStatus: jest.fn().mockResolvedValue({ mode: 'demo', active: true }),
    clearDemoData: jest.fn().mockResolvedValue({ deleted: { AgendaEvent: 5 } }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemoController],
      providers: [{ provide: DemoService, useValue: mockService }],
    }).compile();
    controller = module.get<DemoController>(DemoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getDemoStatus() should return status', async () => {
    const result = await controller.getDemoStatus();
    expect(result).toBeDefined();
    expect(mockService.getDemoStatus).toHaveBeenCalled();
  });

  it('clearDemoData() should return deleted counts', async () => {
    const result = await controller.clearDemoData();
    expect(result).toBeDefined();
    expect(mockService.clearDemoData).toHaveBeenCalled();
  });
});
