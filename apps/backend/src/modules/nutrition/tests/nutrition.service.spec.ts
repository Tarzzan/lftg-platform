import { Test, TestingModule } from "@nestjs/testing";
import { NutritionService } from "../nutrition.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("NutritionService", () => {
  let service: NutritionService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NutritionService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<NutritionService>(NutritionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
