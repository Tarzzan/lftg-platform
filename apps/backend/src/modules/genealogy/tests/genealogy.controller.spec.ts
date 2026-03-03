import { Test, TestingModule } from '@nestjs/testing';
import { GenealogyController } from '../genealogy.controller';

describe('GenealogyController', () => {
  let controller: GenealogyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenealogyController],
    }).compile();

    controller = module.get<GenealogyController>(GenealogyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
