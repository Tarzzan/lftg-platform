import { Test, TestingModule } from "@nestjs/testing";
import { SyncService } from "../sync.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("SyncService", () => {
  let service: SyncService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<SyncService>(SyncService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
