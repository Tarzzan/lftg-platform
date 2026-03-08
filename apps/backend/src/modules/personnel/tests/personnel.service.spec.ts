import { Test, TestingModule } from "@nestjs/testing";
import { PersonnelService } from "../personnel.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("PersonnelService", () => {
  let service: PersonnelService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonnelService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<PersonnelService>(PersonnelService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
