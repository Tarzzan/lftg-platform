import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  const mockService = {
    getAll: jest.fn().mockResolvedValue([]),
    markRead: jest.fn().mockResolvedValue({ count: 0 }),
    create: jest.fn().mockResolvedValue({ id: '1', title: "Test" }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();
    controller = module.get<NotificationsController>(NotificationsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
