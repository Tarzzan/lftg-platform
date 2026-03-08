import { Test, TestingModule } from "@nestjs/testing";
import { TourismeService } from "../tourisme.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("TourismeService", () => {
  let service: TourismeService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TourismeService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<TourismeService>(TourismeService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
