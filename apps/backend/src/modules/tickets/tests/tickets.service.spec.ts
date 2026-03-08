import { Test, TestingModule } from "@nestjs/testing";
import { TicketsService } from "../tickets.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("TicketsService", () => {
  let service: TicketsService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<TicketsService>(TicketsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
