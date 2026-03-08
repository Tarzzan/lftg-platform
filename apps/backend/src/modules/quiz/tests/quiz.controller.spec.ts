import { Test, TestingModule } from "@nestjs/testing";
import { QuizController } from "../quiz.controller";
import { QuizService } from "../quiz.service";

describe("QuizController", () => {
  let controller: QuizController;
  const mockService = { findAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [{ provide: QuizService, useValue: mockService }],
    }).compile();
    controller = module.get<QuizController>(QuizController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
