import { Test, TestingModule } from "@nestjs/testing";
import { PushController } from "../push.controller";
import { PushService } from "../push.service";

describe("PushController", () => {
  let controller: PushController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushController],
      providers: [{ provide: PushService, useValue: mockService }],
    }).compile();
    controller = module.get<PushController>(PushController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
