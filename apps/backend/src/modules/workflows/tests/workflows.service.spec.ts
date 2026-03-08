import { Test, TestingModule } from "@nestjs/testing";
import { WorkflowsService } from "../workflows.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("WorkflowsService", () => {
  let service: WorkflowsService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<WorkflowsService>(WorkflowsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
