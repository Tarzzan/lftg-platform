import { Test, TestingModule } from '@nestjs/testing';
import { GenealogyService } from '../genealogy.service';

describe('GenealogyService', () => {
  let service: GenealogyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenealogyService],
    }).compile();

    service = module.get<GenealogyService>(GenealogyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
