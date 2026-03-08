import { Test, TestingModule } from '@nestjs/testing';
import { FcmController } from './fcm.controller';
import { FcmService } from './fcm.service';

describe('FcmController', () => {
  let controller: FcmController;
  const mockService = {
    sendNotification: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FcmController],
      providers: [{ provide: FcmService, useValue: mockService }],
    }).compile();
    controller = module.get<FcmController>(FcmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
