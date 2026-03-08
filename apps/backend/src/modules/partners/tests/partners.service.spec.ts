import { Test, TestingModule } from "@nestjs/testing";
import { PartnersService } from "../partners.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("PartnersService", () => {
  let service: PartnersService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartnersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<PartnersService>(PartnersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
