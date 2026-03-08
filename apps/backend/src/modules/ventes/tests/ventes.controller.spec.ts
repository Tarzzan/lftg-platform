import { Test, TestingModule } from "@nestjs/testing";
import { VentesController } from "../ventes.controller";
import { VentesService } from "../ventes.service";

describe("VentesController", () => {
  let controller: VentesController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VentesController],
      providers: [{ provide: VentesService, useValue: mockService }],
    }).compile();
    controller = module.get<VentesController>(VentesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
