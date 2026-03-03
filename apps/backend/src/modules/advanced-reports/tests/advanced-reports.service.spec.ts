import { Test, TestingModule } from '@nestjs/testing';
import { Advanced-reportsService } from '../advanced-reports.service';

describe('Advanced-reportsService', () => {
  let service: Advanced-reportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Advanced-reportsService],
    }).compile();

    service = module.get<Advanced-reportsService>(Advanced-reportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
