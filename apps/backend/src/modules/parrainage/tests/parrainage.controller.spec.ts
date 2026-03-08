import { Test, TestingModule } from "@nestjs/testing";
import { ParrainageController } from "../parrainage.controller";
import { ParrainageService } from "../parrainage.service";

describe("ParrainageController", () => {
  let controller: ParrainageController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParrainageController],
      providers: [{ provide: ParrainageService, useValue: mockService }],
    }).compile();
    controller = module.get<ParrainageController>(ParrainageController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
