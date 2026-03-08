import { Test, TestingModule } from "@nestjs/testing";
import { PartnersController } from "../partners.controller";
import { PartnersService } from "../partners.service";

describe("PartnersController", () => {
  let controller: PartnersController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnersController],
      providers: [{ provide: PartnersService, useValue: mockService }],
    }).compile();
    controller = module.get<PartnersController>(PartnersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
