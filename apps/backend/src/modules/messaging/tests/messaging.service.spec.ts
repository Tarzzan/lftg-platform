import { Test, TestingModule } from "@nestjs/testing";
import { MessagingService } from "../messaging.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("MessagingService", () => {
  let service: MessagingService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagingService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<MessagingService>(MessagingService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
