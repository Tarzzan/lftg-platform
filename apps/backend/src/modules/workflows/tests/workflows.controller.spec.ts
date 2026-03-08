import { Test, TestingModule } from "@nestjs/testing";
import { WorkflowsController } from "../workflows.controller";
import { WorkflowsService } from "../workflows.service";

describe("WorkflowsController", () => {
  let controller: WorkflowsController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowsController],
      providers: [{ provide: WorkflowsService, useValue: mockService }],
    }).compile();
    controller = module.get<WorkflowsController>(WorkflowsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
