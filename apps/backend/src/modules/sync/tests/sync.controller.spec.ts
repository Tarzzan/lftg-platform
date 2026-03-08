import { Test, TestingModule } from "@nestjs/testing";
import { SyncController } from "../sync.controller";
import { SyncService } from "../sync.service";

describe("SyncController", () => {
  let controller: SyncController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncController],
      providers: [{ provide: SyncService, useValue: mockService }],
    }).compile();
    controller = module.get<SyncController>(SyncController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
