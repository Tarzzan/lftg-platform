import { Test, TestingModule } from "@nestjs/testing";
import { RolesService } from "../roles.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("RolesService", () => {
  let service: RolesService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<RolesService>(RolesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
