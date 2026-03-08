import { Test, TestingModule } from "@nestjs/testing";
import { VentesService } from "../ventes.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("VentesService", () => {
  let service: VentesService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VentesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<VentesService>(VentesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
