import { Test, TestingModule } from "@nestjs/testing";
import { SmsController } from "../sms.controller";
import { SmsService } from "../sms.service";

describe("SmsController", () => {
  let controller: SmsController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmsController],
      providers: [{ provide: SmsService, useValue: mockService }],
    }).compile();
    controller = module.get<SmsController>(SmsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
