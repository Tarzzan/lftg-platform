import { Test, TestingModule } from "@nestjs/testing";
import { PushService } from "../push.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("PushService", () => {
  let service: PushService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PushService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<PushService>(PushService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
