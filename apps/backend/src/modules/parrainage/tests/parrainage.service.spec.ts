import { Test, TestingModule } from "@nestjs/testing";
import { ParrainageService } from "../parrainage.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("ParrainageService", () => {
  let service: ParrainageService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParrainageService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<ParrainageService>(ParrainageService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
