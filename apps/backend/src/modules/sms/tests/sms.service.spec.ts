import { Test, TestingModule } from "@nestjs/testing";
import { SmsService } from "../sms.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("SmsService", () => {
  let service: SmsService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<SmsService>(SmsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
