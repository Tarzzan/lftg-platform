import { Test, TestingModule } from "@nestjs/testing";
import { QuizService } from "../quiz.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("QuizService", () => {
  let service: QuizService;
  const mockPrisma = { $connect: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<QuizService>(QuizService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
