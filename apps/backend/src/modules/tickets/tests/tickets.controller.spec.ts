import { Test, TestingModule } from "@nestjs/testing";
import { TicketsController } from "../tickets.controller";
import { TicketsService } from "../tickets.service";

describe("TicketsController", () => {
  let controller: TicketsController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [{ provide: TicketsService, useValue: mockService }],
    }).compile();
    controller = module.get<TicketsController>(TicketsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
