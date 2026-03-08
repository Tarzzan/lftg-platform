import { Test, TestingModule } from "@nestjs/testing";
import { MessagingController } from "../messaging.controller";
import { MessagingService } from "../messaging.service";

describe("MessagingController", () => {
  let controller: MessagingController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagingController],
      providers: [{ provide: MessagingService, useValue: mockService }],
    }).compile();
    controller = module.get<MessagingController>(MessagingController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
