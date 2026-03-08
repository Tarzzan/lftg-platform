import { Test, TestingModule } from "@nestjs/testing";
import { TourismeController } from "../tourisme.controller";
import { TourismeService } from "../tourisme.service";

describe("TourismeController", () => {
  let controller: TourismeController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TourismeController],
      providers: [{ provide: TourismeService, useValue: mockService }],
    }).compile();
    controller = module.get<TourismeController>(TourismeController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
