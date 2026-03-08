import { Test, TestingModule } from "@nestjs/testing";
import { StripeController } from "../stripe.controller";
import { StripeService } from "../stripe.service";

describe("StripeController", () => {
  let controller: StripeController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeController],
      providers: [{ provide: StripeService, useValue: mockService }],
    }).compile();
    controller = module.get<StripeController>(StripeController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
