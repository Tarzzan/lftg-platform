import { Test, TestingModule } from "@nestjs/testing";
import { StripeService } from "../stripe.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("StripeService", () => {
  let service: StripeService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<StripeService>(StripeService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
