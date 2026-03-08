import { Test, TestingModule } from "@nestjs/testing";
import { NutritionController } from "../nutrition.controller";
import { NutritionService } from "../nutrition.service";

describe("NutritionController", () => {
  let controller: NutritionController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NutritionController],
      providers: [{ provide: NutritionService, useValue: mockService }],
    }).compile();
    controller = module.get<NutritionController>(NutritionController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
